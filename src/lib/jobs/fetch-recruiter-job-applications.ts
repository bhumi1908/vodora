import type { SupabaseClient } from "@supabase/supabase-js";

import type { JobApplicationStatus } from "@/lib/jobs/candidate-jobs.types";
import { formatRelativePosted } from "@/lib/jobs/format-job-posting";
import {
  mapApplicationStatus,
  toDbApplicationStatus,
} from "@/lib/jobs/map-application-status";
import type {
  RecruiterJobApplicantDetail,
  RecruiterJobApplicantSummary,
  RecruiterJobApplicationDocument,
  RecruiterJobApplicantsJobSummary,
  RecruiterJobApplicantsResponse,
} from "@/lib/jobs/recruiter-job-applications.types";
import { formatLocation, getInitials } from "@/lib/profile/format";
import type { CandidateProfileDocument } from "@/lib/profile/types";
import { fetchRecruiterCandidateReferences } from "@/lib/references/fetch-recruiter-candidate-references";
import { fetchRecruiterCandidateProfile } from "@/lib/recruiter/fetch-recruiter-candidate-profile";
import type { Database } from "@/lib/supabase/database.types";

type Supabase = SupabaseClient<Database>;

type RpcCandidateDetailsRow = {
  candidate_id: string;
  vodora_id: string;
  first_name: string;
  last_name: string;
  email: string;
  title: string | null;
  company: string | null;
};

type JobApplicationRow = Database["public"]["Tables"]["job_applications"]["Row"];

async function fetchCandidateDetailsFromRpc(
  supabase: Supabase,
  candidateId: string,
): Promise<RpcCandidateDetailsRow | null> {
  const { data, error } = await supabase.rpc(
    "get_reference_collection_candidate_details",
    {
      p_candidate_id: candidateId,
    },
  );

  if (error || !data || typeof data !== "object") {
    return null;
  }

  const row = data as Partial<RpcCandidateDetailsRow>;

  if (
    !row.candidate_id ||
    !row.vodora_id ||
    !row.first_name ||
    !row.last_name ||
    !row.email?.trim()
  ) {
    return null;
  }

  return row as RpcCandidateDetailsRow;
}

function toApplicationDocument(
  document: CandidateProfileDocument | undefined,
): RecruiterJobApplicationDocument | null {
  if (!document) {
    return null;
  }

  return {
    id: document.id,
    name: document.name,
    type: document.type,
    url: document.url,
    uploadedAt: document.uploadedAt,
  };
}

function findDocumentById(
  documents: CandidateProfileDocument[],
  documentId: string | null,
): CandidateProfileDocument | undefined {
  if (!documentId) {
    return undefined;
  }

  return documents.find((document) => document.id === documentId);
}

async function buildApplicantSummary(
  supabase: Supabase,
  application: JobApplicationRow,
): Promise<RecruiterJobApplicantSummary | null> {
  const candidateDetails = await fetchCandidateDetailsFromRpc(
    supabase,
    application.candidate_id,
  );

  if (!candidateDetails) {
    return null;
  }

  const profile = await fetchRecruiterCandidateProfile(
    supabase,
    candidateDetails.vodora_id,
  );

  const documents = profile?.documents ?? [];
  const resume = toApplicationDocument(
    findDocumentById(documents, application.resume_document_id),
  );
  const coverLetterDocument = toApplicationDocument(
    findDocumentById(documents, application.cover_letter_document_id),
  );

  const name = `${candidateDetails.first_name} ${candidateDetails.last_name}`.trim();
  const location = profile
    ? formatLocation(profile.location, null)
    : null;

  let referenceCount = 0;

  if (application.references_attached) {
    if (application.included_reference_ids.length > 0) {
      referenceCount = application.included_reference_ids.length;
    } else {
      const referencesResult = await fetchRecruiterCandidateReferences(
        supabase,
        application.candidate_id,
      );
      referenceCount = referencesResult.references.filter(
        (reference) => reference.status === "verified",
      ).length;
    }
  }

  return {
    applicationId: application.id,
    candidateId: application.candidate_id,
    vodoraId: candidateDetails.vodora_id,
    name,
    title: candidateDetails.title,
    company: candidateDetails.company,
    email: profile?.email ?? candidateDetails.email.trim(),
    phone: profile?.phone ?? null,
    location,
    profilePictureUrl: profile?.profilePictureUrl ?? null,
    avatarInitials: profile?.avatarInitials ?? getInitials(
      candidateDetails.first_name,
      candidateDetails.last_name,
    ),
    status: mapApplicationStatus(application.status),
    appliedAt: application.applied_at,
    appliedLabel: formatRelativePosted(application.applied_at),
    coverLetter: application.cover_letter?.trim() ?? "",
    referencesAttached: application.references_attached,
    referenceCount,
    resume,
    coverLetterDocument,
  };
}

async function verifyRecruiterOwnsJob(
  supabase: Supabase,
  recruiterId: string,
  jobId: string,
): Promise<RecruiterJobApplicantsJobSummary | null> {
  const { data: job, error } = await supabase
    .from("job_postings")
    .select(
      "id, title, company_display_name, location, salary_display, is_urgent, status, work_type_id",
    )
    .eq("id", jobId)
    .eq("recruiter_id", recruiterId)
    .maybeSingle();

  if (error || !job) {
    return null;
  }

  const { data: workType } = await supabase
    .from("work_types")
    .select("name")
    .eq("id", job.work_type_id)
    .maybeSingle();

  const { count } = await supabase
    .from("job_applications")
    .select("id", { count: "exact", head: true })
    .eq("job_posting_id", jobId);

  return {
    id: job.id,
    title: job.title,
    company: job.company_display_name,
    location: job.location,
    salary: job.salary_display ?? "Competitive",
    type: workType?.name ?? "Full Time",
    urgent: job.is_urgent,
    status: job.status,
    applicantCount: count ?? 0,
  };
}

export async function fetchRecruiterJobApplicants(
  supabase: Supabase,
  recruiterId: string,
  jobId: string,
): Promise<{ data: RecruiterJobApplicantsResponse | null; error: string | null }> {
  const job = await verifyRecruiterOwnsJob(supabase, recruiterId, jobId);

  if (!job) {
    return { data: null, error: "Job not found." };
  }

  const { data: applicationRows, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("job_posting_id", jobId)
    .order("applied_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  const applicants = (
    await Promise.all(
      (applicationRows ?? []).map((application) =>
        buildApplicantSummary(supabase, application),
      ),
    )
  ).filter((applicant): applicant is RecruiterJobApplicantSummary => applicant !== null);

  return {
    data: {
      job,
      applicants,
    },
    error: null,
  };
}

export async function fetchRecruiterJobApplicantDetail(
  supabase: Supabase,
  recruiterId: string,
  jobId: string,
  applicationId: string,
): Promise<{ data: RecruiterJobApplicantDetail | null; error: string | null }> {
  const job = await verifyRecruiterOwnsJob(supabase, recruiterId, jobId);

  if (!job) {
    return { data: null, error: "Job not found." };
  }

  const { data: application, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("id", applicationId)
    .eq("job_posting_id", jobId)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!application) {
    return { data: null, error: "Application not found." };
  }

  const summary = await buildApplicantSummary(supabase, application);

  if (!summary) {
    return { data: null, error: "Candidate not found." };
  }

  let references: RecruiterJobApplicantDetail["references"] = [];

  if (application.references_attached) {
    const referencesResult = await fetchRecruiterCandidateReferences(
      supabase,
      application.candidate_id,
    );

    references = referencesResult.references;

    if (application.included_reference_ids.length > 0) {
      const allowedIds = new Set(application.included_reference_ids);
      references = references.filter((reference) => allowedIds.has(reference.id));
    }
  }

  return {
    data: {
      ...summary,
      references,
    },
    error: null,
  };
}

export async function updateRecruiterJobApplicationStatus(
  supabase: Supabase,
  recruiterId: string,
  jobId: string,
  applicationId: string,
  status: JobApplicationStatus,
): Promise<{ success: boolean; error: string | null }> {
  const job = await verifyRecruiterOwnsJob(supabase, recruiterId, jobId);

  if (!job) {
    return { success: false, error: "Job not found." };
  }

  const { data: application, error: fetchError } = await supabase
    .from("job_applications")
    .select("id")
    .eq("id", applicationId)
    .eq("job_posting_id", jobId)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }

  if (!application) {
    return { success: false, error: "Application not found." };
  }

  const { error: updateError } = await supabase
    .from("job_applications")
    .update({ status: toDbApplicationStatus(status) })
    .eq("id", applicationId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true, error: null };
}

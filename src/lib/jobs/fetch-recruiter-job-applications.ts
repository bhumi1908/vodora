import type { SupabaseClient } from "@supabase/supabase-js";

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
import type { JobApplicationStatus } from "@/lib/jobs/candidate-jobs.types";
import { formatLocation, getInitials } from "@/lib/profile/format";
import type { CandidateProfileData, CandidateProfileDocument } from "@/lib/profile/types";
import { fetchRecruiterCandidateReferences } from "@/lib/references/fetch-recruiter-candidate-references";
import { fetchRecruiterCandidateProfilesBatch } from "@/lib/recruiter/fetch-recruiter-candidate-profile";
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

function parseCandidateDetailsBatch(data: unknown): RpcCandidateDetailsRow[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const row = item as Partial<RpcCandidateDetailsRow>;

    if (
      !row.candidate_id ||
      !row.vodora_id ||
      !row.first_name ||
      !row.last_name ||
      !row.email?.trim()
    ) {
      return [];
    }

    return [row as RpcCandidateDetailsRow];
  });
}

function parseVerifiedReferenceCountsBatch(
  data: unknown,
): Map<string, number> {
  const counts = new Map<string, number>();

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return counts;
  }

  for (const [candidateId, count] of Object.entries(data)) {
    if (typeof count === "number" && Number.isFinite(count)) {
      counts.set(candidateId, count);
    }
  }

  return counts;
}

async function fetchCandidateDetailsBatch(
  supabase: Supabase,
  candidateIds: string[],
): Promise<Map<string, RpcCandidateDetailsRow>> {
  if (candidateIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase.rpc(
    "get_reference_collection_candidate_details_batch",
    {
      p_candidate_ids: candidateIds,
    },
  );

  if (error) {
    return new Map();
  }

  return new Map(
    parseCandidateDetailsBatch(data).map((row) => [row.candidate_id, row]),
  );
}

async function fetchVerifiedReferenceCountsBatch(
  supabase: Supabase,
  candidateIds: string[],
): Promise<Map<string, number>> {
  if (candidateIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase.rpc("count_verified_references_batch", {
    p_candidate_ids: candidateIds,
  });

  if (error) {
    return new Map();
  }

  return parseVerifiedReferenceCountsBatch(data);
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

function buildApplicantSummary(
  application: JobApplicationRow,
  candidateDetails: RpcCandidateDetailsRow,
  profile: CandidateProfileData | null,
  verifiedReferenceCount: number,
): RecruiterJobApplicantSummary {
  const documents = profile?.documents ?? [];
  const resume = toApplicationDocument(
    findDocumentById(documents, application.resume_document_id),
  );
  const coverLetterDocument = toApplicationDocument(
    findDocumentById(documents, application.cover_letter_document_id),
  );

  const name = `${candidateDetails.first_name} ${candidateDetails.last_name}`.trim();
  const location = profile ? formatLocation(profile.location, null) : null;

  let referenceCount = 0;

  if (application.references_attached) {
    if (application.included_reference_ids.length > 0) {
      referenceCount = application.included_reference_ids.length;
    } else {
      referenceCount = verifiedReferenceCount;
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
    avatarInitials:
      profile?.avatarInitials ??
      getInitials(candidateDetails.first_name, candidateDetails.last_name),
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

  const applications = applicationRows ?? [];

  if (applications.length === 0) {
    return {
      data: {
        job,
        applicants: [],
      },
      error: null,
    };
  }

  const candidateIds = applications.map((application) => application.candidate_id);
  const referenceCountCandidateIds = applications
    .filter(
      (application) =>
        application.references_attached &&
        application.included_reference_ids.length === 0,
    )
    .map((application) => application.candidate_id);

  const [candidateDetailsById, verifiedReferenceCounts] = await Promise.all([
    fetchCandidateDetailsBatch(supabase, candidateIds),
    fetchVerifiedReferenceCountsBatch(supabase, referenceCountCandidateIds),
  ]);

  const vodoraIds = [...candidateDetailsById.values()].map((row) => row.vodora_id);
  const profilesByVodoraId = await fetchRecruiterCandidateProfilesBatch(
    supabase,
    vodoraIds,
  );

  const applicants = applications.flatMap((application) => {
    const candidateDetails = candidateDetailsById.get(application.candidate_id);

    if (!candidateDetails) {
      return [];
    }

    const profile = profilesByVodoraId.get(candidateDetails.vodora_id) ?? null;

    return [
      buildApplicantSummary(
        application,
        candidateDetails,
        profile,
        verifiedReferenceCounts.get(application.candidate_id) ?? 0,
      ),
    ];
  });

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

  const candidateDetailsById = await fetchCandidateDetailsBatch(supabase, [
    application.candidate_id,
  ]);
  const candidateDetails = candidateDetailsById.get(application.candidate_id);

  if (!candidateDetails) {
    return { data: null, error: "Candidate not found." };
  }

  const profilesByVodoraId = await fetchRecruiterCandidateProfilesBatch(supabase, [
    candidateDetails.vodora_id,
  ]);
  const profile = profilesByVodoraId.get(candidateDetails.vodora_id) ?? null;

  let verifiedReferenceCount = 0;

  if (
    application.references_attached &&
    application.included_reference_ids.length === 0
  ) {
    const counts = await fetchVerifiedReferenceCountsBatch(supabase, [
      application.candidate_id,
    ]);
    verifiedReferenceCount = counts.get(application.candidate_id) ?? 0;
  }

  const summary = buildApplicantSummary(
    application,
    candidateDetails,
    profile,
    verifiedReferenceCount,
  );

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

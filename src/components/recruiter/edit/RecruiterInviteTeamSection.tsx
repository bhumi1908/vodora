"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import {
  FormError,
  FormField,
  FormSelect,
  FormSuccess,
} from "@/components/auth/shared/FormFields";
import type { CompanyInvitationRecord } from "@/lib/recruiter/company-invitation.types";
import { COMPANY_INVITATION_ROLE_OPTIONS } from "@/lib/recruiter/hiring-preferences";
import { useCreateCompanyInvitationMutation } from "@/lib/query/use-recruiter-profile-mutations";

type RecruiterInviteTeamSectionProps = {
  initialInvitations: CompanyInvitationRecord[];
  onInvitationCreated?: (invitation: CompanyInvitationRecord) => void;
};

export function RecruiterInviteTeamSection({
  initialInvitations,
  onInvitationCreated,
}: RecruiterInviteTeamSectionProps) {
  const createMutation = useCreateCompanyInvitationMutation();
  const [invitations, setInvitations] = useState(initialInvitations);
  const [email, setEmail] = useState("");
  const [teamRole, setTeamRole] = useState("member");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError("");
    setSuccess("");

    const trimmedEmail = email.trim();

    try {
      const result = await createMutation.mutateAsync({
        email: trimmedEmail,
        teamRole,
      });

      if (!result.success) {
        setError(result.error ?? "Could not save invitation.");
        return;
      }

      const nextInvitation: CompanyInvitationRecord = {
        id: result.invitation.id,
        email: result.invitation.email,
        teamRole: result.invitation.teamRole,
        status: result.invitation.status,
        createdAt: result.invitation.createdAt,
        expiresAt: result.invitation.expiresAt,
      };

      setInvitations((current) => [nextInvitation, ...current]);
      onInvitationCreated?.(nextInvitation);
      setEmail("");
      setSuccess(`Invitation saved for ${result.invitation.email}.`);
    } catch {
      setError("Could not save invitation.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_160px_auto] lg:items-end">
        <FormField
          id="recruiter-invite-email"
          label="Team Member Email"
          type="email"
          required
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError("");
            setSuccess("");
          }}
          placeholder="colleague@company.com"
        />
        <FormSelect
          id="recruiter-invite-role"
          label="Team Role"
          required
          value={teamRole}
          onChange={(event) => setTeamRole(event.target.value)}
          options={[...COMPANY_INVITATION_ROLE_OPTIONS]}
        />
        <button
          type="button"
          disabled={createMutation.isPending || !email.trim()}
          onClick={() => void handleSubmit()}
          className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 lg:w-auto"
        >
          <Plus className="h-4 w-4" />
          {createMutation.isPending ? "Saving..." : "Send Invitation"}
        </button>
      </div>

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}

      {invitations.length > 0 ? (
        <div>
          <p className="mb-3 text-sm font-semibold text-gray-900">
            Pending invitations
          </p>
          <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex flex-col gap-1 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <span className="min-w-0 font-medium break-all text-gray-900">
                  {invitation.email}
                </span>
                <span className="shrink-0 capitalize text-gray-500">
                  {invitation.teamRole} · Pending
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-6 text-center text-sm text-gray-500">
          No pending invitations yet. Add a colleague above to get started.
        </p>
      )}
    </div>
  );
}

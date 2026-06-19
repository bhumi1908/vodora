"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import {
  AuthFormGrid,
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

    try {
      const result = await createMutation.mutateAsync({ email, teamRole });

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
      setSuccess(
        "Invitation saved. Email delivery will be enabled in a future update.",
      );
    } catch {
      setError("Could not save invitation.");
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Invite colleagues to join your company on Vodora. Invitations are saved
        now; email delivery will be added next.
      </p>

      <AuthFormGrid>
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
      </AuthFormGrid>

      <div className="flex justify-end">
        <button
          type="button"
          disabled={createMutation.isPending || !email.trim()}
          onClick={() => void handleSubmit()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {createMutation.isPending ? "Saving..." : "Save Invitation"}
        </button>
      </div>

      {invitations.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-medium text-gray-700">
            Pending Invitations
          </p>
          <ul className="space-y-2">
            {invitations.map((invitation) => (
              <li
                key={invitation.id}
                className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-gray-900 break-all">
                  {invitation.email}
                </span>
                <span className="text-gray-500 capitalize">
                  {invitation.teamRole} · Pending
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? <FormError message={error} /> : null}
      {success ? <FormSuccess title="Saved" message={success} /> : null}
    </div>
  );
}

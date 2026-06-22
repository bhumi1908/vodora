import { toast } from "sonner";

import {
  CANDIDATE_CONNECTIONS_PATH,
  RECRUITER_CONNECTIONS_PATH,
} from "@/lib/auth/routes";

function formatPersonLabel(name?: string): string {
  const trimmed = name?.trim();
  return trimmed ? trimmed : "them";
}

export function showConnectionRequestSentToast(personName?: string) {
  toast.success(
    `Connection request sent to ${formatPersonLabel(personName)}. They'll be notified and can respond from their Connections page.`,
  );
}

export function showConnectionAcceptedToast(personName?: string) {
  toast.success(
    `You're now connected with ${formatPersonLabel(personName)}! You can view their profile anytime from your Connections.`,
  );
}

export function showConnectionRequestErrorToast() {
  toast.error("Could not send connection request. Please try again.");
}

export function showConnectionRespondErrorToast() {
  toast.error("Could not update this connection request. Please try again.");
}

export function showNewConnectionRequestToast(
  pendingCount: number,
  role: "candidate" | "recruiter",
) {
  const label =
    pendingCount === 1
      ? "You have a new connection request."
      : `You have ${pendingCount} connection requests waiting.`;

  const href =
    role === "recruiter" ? RECRUITER_CONNECTIONS_PATH : CANDIDATE_CONNECTIONS_PATH;

  toast.info(label, {
    action: {
      label: "View",
      onClick: () => {
        window.location.href = href;
      },
    },
  });
}

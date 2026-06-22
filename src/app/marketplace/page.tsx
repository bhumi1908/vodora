import { redirect } from "next/navigation";

import { CANDIDATE_CONNECTIONS_PATH } from "@/lib/auth/routes";

export default function MarketplacePage() {
  redirect(CANDIDATE_CONNECTIONS_PATH);
}

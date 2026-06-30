import type { ConnectionTab } from "@/lib/connections/connection.types";

export function parseConnectionTab(value: string | null): ConnectionTab {
  if (value === "sent" || value === "connected") {
    return value;
  }

  return "received";
}

export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return { firstName: "Candidate", lastName: "User" };
  }

  const spaceIndex = trimmed.indexOf(" ");

  if (spaceIndex === -1) {
    return { firstName: trimmed, lastName: "User" };
  }

  const firstName = trimmed.slice(0, spaceIndex).trim();
  const lastName = trimmed.slice(spaceIndex + 1).trim();

  return {
    firstName: firstName || "Candidate",
    lastName: lastName || "User",
  };
}

export const REFERENCE_RELATIONSHIP_OPTIONS = [
  { value: "direct_manager", label: "Direct Manager" },
  { value: "former_supervisor", label: "Former Supervisor" },
  { value: "colleague", label: "Colleague" },
  { value: "mentor", label: "Mentor" },
  { value: "client", label: "Client" },
  { value: "other", label: "Other" },
] as const;

export type ReferenceRelationship =
  (typeof REFERENCE_RELATIONSHIP_OPTIONS)[number]["value"];

export type RequestReferenceFormData = {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: ReferenceRelationship | "";
  message: string;
  allowProfileCreation: boolean;
};

export function createEmptyReferenceRequest(): RequestReferenceFormData {
  return {
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    relationship: "",
    message: "",
    allowProfileCreation: false,
  };
}

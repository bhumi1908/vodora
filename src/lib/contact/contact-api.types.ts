import type { ContactFormData } from "@/lib/contact/validation";

export type ContactApiResponse = {
  success: boolean;
  error?: string;
  fieldErrors?: Partial<Record<keyof ContactFormData, string>>;
};

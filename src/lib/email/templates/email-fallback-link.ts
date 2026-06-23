/** Fallback link shown when the primary CTA button is unavailable. */
export function buildEmailFallbackLinkHtml(url: string): string {
  return `<p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
    If the button does not work, <a href="${url}" style="color:#2563eb;text-decoration:underline;">click here</a>.
  </p>`;
}

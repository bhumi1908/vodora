const VODORA_LOGO_BOX_SIZE_PX = 36;
const VODORA_LOGO_ICON_SIZE_PX = 16;
const VODORA_BLUE = "#2563eb";

/** Lucide briefcase icon — same paths as login / navbar (`h-9 w-9` box, `h-4 w-4` icon). */
const VODORA_BRIEFCASE_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${VODORA_LOGO_ICON_SIZE_PX}" height="${VODORA_LOGO_ICON_SIZE_PX}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;margin:0 auto;">
  <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  <rect width="20" height="14" x="2" y="6" rx="2"></rect>
</svg>`;

/** Email-safe equivalent of the login-page logo mark. */
function buildVodoraLogoMarkHtml(): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="width:${VODORA_LOGO_BOX_SIZE_PX}px;height:${VODORA_LOGO_BOX_SIZE_PX}px;background-color:${VODORA_BLUE};border-radius:6px;">
  <tr>
    <td align="center" valign="middle" style="width:${VODORA_LOGO_BOX_SIZE_PX}px;height:${VODORA_LOGO_BOX_SIZE_PX}px;line-height:0;">
      ${VODORA_BRIEFCASE_ICON_SVG}
    </td>
  </tr>
</table>`;
}

/** Vodora logo mark + wordmark for transactional emails. */
export function buildEmailBrandHeaderHtml(): string {
  const logoMark = buildVodoraLogoMarkHtml();

  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
  <tr>
    <td style="vertical-align:middle;padding-right:8px;line-height:0;">
      ${logoMark}
    </td>
    <td style="vertical-align:middle;font-size:20px;font-weight:600;color:#111827;line-height:1;">
      Vodora
    </td>
  </tr>
</table>`;
}

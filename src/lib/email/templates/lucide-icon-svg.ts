type IconNodeElement =
  | "circle"
  | "ellipse"
  | "g"
  | "line"
  | "path"
  | "polygon"
  | "polyline"
  | "rect";

type IconNode = readonly (readonly [IconNodeElement, Record<string, string>])[];

type LucideIconSvgOptions = {
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
};

/** Serialize a Lucide icon node into email-safe inline SVG markup. */
export function buildLucideIconSvg(
  iconNode: IconNode,
  { width, height, stroke, strokeWidth }: LucideIconSvgOptions,
): string {
  const children = iconNode
    .map(([tag, attrs]) => {
      const attrString = Object.entries(attrs)
        .filter(([key]) => key !== "key")
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");

      return `<${tag} ${attrString}></${tag}>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;margin:0 auto;">${children}</svg>`;
}

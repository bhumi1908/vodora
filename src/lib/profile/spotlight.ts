import type { SpotlightBlock, SpotlightBlockType } from "@/lib/profile/spotlight.types";

const VALID_BLOCK_TYPES = new Set<SpotlightBlockType>([
  "bio",
  "achievement",
  "code",
  "video",
  "quote",
  "passions",
]);

const VALID_CODE_LANGUAGES = new Set([
  "JavaScript",
  "TypeScript",
  "Python",
  "Go",
  "Rust",
  "SQL",
  "Bash",
  "CSS",
  "HTML",
  "Java",
]);

export const SINGLETON_SPOTLIGHT_BLOCK_TYPES = new Set<SpotlightBlockType>([
  "bio",
  "quote",
]);

export const SPOTLIGHT_LIMITS = {
  maxBlocks: 20,
  maxTextLength: 5000,
  maxQuoteLength: 160,
  maxTitleLength: 255,
  maxCodeLength: 10000,
  maxVideoUrlLength: 500,
  maxVideoTitleLength: 255,
  maxTags: 20,
  maxTagLength: 50,
} as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.length > maxLength) {
    return undefined;
  }

  return trimmed;
}

function readQuoteText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.length <= 5) {
    return undefined;
  }

  return trimmed.slice(0, SPOTLIGHT_LIMITS.maxQuoteLength);
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const tags = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (tags.length === 0) {
    return undefined;
  }

  return tags;
}

function isValidBlockShape(block: SpotlightBlock): boolean {
  switch (block.type) {
    case "bio":
    case "quote":
      return Boolean(block.text && block.text.length > 5);
    case "achievement":
      return Boolean(
        block.title &&
          block.title.length > 2 &&
          block.text &&
          block.text.length > 5,
      );
    case "code":
      return Boolean(block.code && block.code.length > 2);
    case "video":
      return Boolean(block.videoUrl && block.videoUrl.length > 5);
    case "passions":
      return Boolean(block.tags && block.tags.length > 0);
    default:
      return false;
  }
}

export function parseSpotlightBlock(value: unknown): SpotlightBlock | null {
  if (!isRecord(value)) {
    return null;
  }

  const type = value.type;

  if (typeof type !== "string" || !VALID_BLOCK_TYPES.has(type as SpotlightBlockType)) {
    return null;
  }

  const id = readString(value.id, 64);

  if (!id) {
    return null;
  }

  const block: SpotlightBlock = {
    id,
    type: type as SpotlightBlockType,
  };

  const blockType = type as SpotlightBlockType;
  const text =
    blockType === "quote"
      ? readQuoteText(value.text)
      : readString(value.text, SPOTLIGHT_LIMITS.maxTextLength);
  const title = readString(value.title, SPOTLIGHT_LIMITS.maxTitleLength);
  const code = readString(value.code, SPOTLIGHT_LIMITS.maxCodeLength);
  const language = readString(value.language, 50);
  const videoUrl = readString(value.videoUrl, SPOTLIGHT_LIMITS.maxVideoUrlLength);
  const videoTitle = readString(
    value.videoTitle,
    SPOTLIGHT_LIMITS.maxVideoTitleLength,
  );
  const rawTags = readStringArray(value.tags);

  if (text) {
    block.text = text;
  }

  if (title) {
    block.title = title;
  }

  if (code) {
    block.code = code;
  }

  if (language && VALID_CODE_LANGUAGES.has(language)) {
    block.language = language;
  }

  if (videoUrl) {
    block.videoUrl = videoUrl;
  }

  if (videoTitle) {
    block.videoTitle = videoTitle;
  }

  if (rawTags) {
    const uniqueTags = [...new Set(rawTags)].slice(0, SPOTLIGHT_LIMITS.maxTags);

    if (
      uniqueTags.some((tag) => tag.length > SPOTLIGHT_LIMITS.maxTagLength) ||
      uniqueTags.length === 0
    ) {
      return null;
    }

    block.tags = uniqueTags;
  }

  if (!isValidBlockShape(block)) {
    return null;
  }

  return block;
}

export function dedupeSingletonSpotlightBlocks(
  blocks: SpotlightBlock[],
): SpotlightBlock[] {
  const seenSingletons = new Set<SpotlightBlockType>();

  return blocks.filter((block) => {
    if (!SINGLETON_SPOTLIGHT_BLOCK_TYPES.has(block.type)) {
      return true;
    }

    if (seenSingletons.has(block.type)) {
      return false;
    }

    seenSingletons.add(block.type);
    return true;
  });
}

export function parseSpotlightBlocks(value: unknown): SpotlightBlock[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return dedupeSingletonSpotlightBlocks(
    value
      .map((entry) => parseSpotlightBlock(entry))
      .filter((entry): entry is SpotlightBlock => entry !== null)
      .slice(0, SPOTLIGHT_LIMITS.maxBlocks),
  );
}

export function validateSpotlightBlocks(blocks: SpotlightBlock[]): string | null {
  if (blocks.length > SPOTLIGHT_LIMITS.maxBlocks) {
    return `You can add up to ${SPOTLIGHT_LIMITS.maxBlocks} spotlight blocks.`;
  }

  const ids = new Set<string>();
  const singletonCounts = new Map<SpotlightBlockType, number>();

  for (const block of blocks) {
    if (!VALID_BLOCK_TYPES.has(block.type)) {
      return "One or more spotlight blocks have an invalid type.";
    }

    if (!block.id.trim()) {
      return "Each spotlight block must have an id.";
    }

    if (ids.has(block.id)) {
      return "Spotlight block ids must be unique.";
    }

    ids.add(block.id);

    if (SINGLETON_SPOTLIGHT_BLOCK_TYPES.has(block.type)) {
      const count = (singletonCounts.get(block.type) ?? 0) + 1;
      singletonCounts.set(block.type, count);

      if (count > 1) {
        return block.type === "bio"
          ? "You can only have one bio."
          : "You can only have one personal quote.";
      }
    }

    if (!isValidBlockShape(block)) {
      return "One or more spotlight blocks are incomplete or invalid.";
    }

    if (block.type === "quote" && (block.text?.length ?? 0) > SPOTLIGHT_LIMITS.maxQuoteLength) {
      return `Personal quotes must be ${SPOTLIGHT_LIMITS.maxQuoteLength} characters or fewer.`;
    }

    if (block.type === "code" && block.language && !VALID_CODE_LANGUAGES.has(block.language)) {
      return "One or more code blocks have an unsupported language.";
    }
  }

  return null;
}

export function createSpotlightBlockId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

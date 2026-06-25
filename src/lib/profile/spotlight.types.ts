export type SpotlightBlockType =
  | "bio"
  | "achievement"
  | "code"
  | "video"
  | "quote"
  | "passions";

export type SpotlightBlock = {
  id: string;
  type: SpotlightBlockType;
  text?: string;
  title?: string;
  code?: string;
  language?: string;
  videoUrl?: string;
  videoTitle?: string;
  tags?: string[];
};

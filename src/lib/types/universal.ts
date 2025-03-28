export enum Part {
  PLAN = "PLAN",
  DESIGN = "DESIGN",
  ANDROID = "ANDROID",
  IOS = "iOS",
  WEB = "WEB",
  SERVER = "SERVER",
}

export enum PartExtraType {
  ALL = "ALL",
}

export type ExtraPart = PartExtraType | Part;

type TabTypeOption<T> = {
  value: T;
  label: string;
};

export type TabType = TabTypeOption<Part>;
export type ExtraTabType = TabTypeOption<ExtraPart>;

export type LabelKeyType = string | number | symbol;

export enum CarouselArrowType {
  External = "external",
  None = "none",
  // Internal = 'internal',
  // Overlay = 'overlay',
}

export enum CarouselOverflowType {
  Blur = "blur",
  Visible = "visible",
}

export enum PageType {
  BLOG = "BLOG",
  PROJECT = "PROJECT",
}

export type TextWeightType = {
  content: string;
  weight: "normal" | "bold";
};

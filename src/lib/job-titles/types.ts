export type JobTitleRecord = {
  id: string;
  name: string;
  sortOrder: number;
  subcategoryName: string;
  subcategorySortOrder: number;
  categoryName: string;
  categorySortOrder: number;
};

export type JobTitleOptionGroup = {
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
};

export type ResolvedJobTitle = {
  id: string;
  name: string;
  industryCategoryId: string | null;
};

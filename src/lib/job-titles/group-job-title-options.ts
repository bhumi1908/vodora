import type { JobTitleOptionGroup, JobTitleRecord } from "@/lib/job-titles/types";

function getGroupKey(record: JobTitleRecord): string {
  return `${record.categorySortOrder}:${record.categoryName}:${record.subcategorySortOrder}:${record.subcategoryName}`;
}

function getGroupLabel(record: JobTitleRecord): string {
  return `${record.categoryName} · ${record.subcategoryName}`;
}

export function groupJobTitleOptions(
  records: JobTitleRecord[],
): JobTitleOptionGroup[] {
  const groups = new Map<string, JobTitleOptionGroup>();

  for (const record of records) {
    const key = getGroupKey(record);
    const existing = groups.get(key);

    if (existing) {
      existing.options.push({
        value: record.id,
        label: record.name,
      });
      continue;
    }

    groups.set(key, {
      label: getGroupLabel(record),
      options: [
        {
          value: record.id,
          label: record.name,
        },
      ],
    });
  }

  return Array.from(groups.values());
}

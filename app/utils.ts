const SIZE_LABELS: Record<string, string> = {
  XS: "X-Small",
  S: "Small",
  M: "Medium",
  L: "Large",
  XL: "X-Large",
  XXL: "2X-Large",
  "2XL": "2X-Large",
  XXXL: "3X-Large",
  "3XL": "3X-Large",
};

export function getVariantLabel(title: string): string {
  const normalized = title.trim().toUpperCase();
  return SIZE_LABELS[normalized] ?? title;
}

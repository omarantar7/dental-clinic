export function getStatus(total: number | string, paid: number | string) {
  const t = Number(total);
  const p = Number(paid);

  if (!t || t <= 0) return { variant: "neutral", label: "No balance" } as const;
  if (p >= t) return { variant: "success", label: "Fully paid" } as const;
  if (p > 0)
    return { variant: "warning", label: "Payment in progress" } as const;
  return { variant: "danger", label: "Never paid" } as const;
}

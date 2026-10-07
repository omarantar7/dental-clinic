const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString();
};

const formatDateTime = (date: Date | string) => {
  return new Date(date).toLocaleString();
};

// e.g. "Oct 2, 2026, 9:00 – 10:30 AM"; collapses the shared date/period.
const formatDateTimeRange = (start: Date | string, end: Date | string) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).formatRange(new Date(start), new Date(end));
};

const toDateInputValue =(date: Date | string | null) => {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
};

const toDateTimeInputValue = (date: Date | string | null) => {
  if (!date) return "";
  const value = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
};

export {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDateTimeRange,
  toDateInputValue,
  toDateTimeInputValue,
};

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

const toDateInputValue = (date: Date | string | null) => {
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
  toDateInputValue,
  toDateTimeInputValue,
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString();
};

const toDateInputValue = (date: Date | string | null) => {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
};

export { formatCurrency, formatDate, toDateInputValue };

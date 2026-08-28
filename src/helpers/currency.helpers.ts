export const formatCurrency = (val: number) =>
  `₦ ${val.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;

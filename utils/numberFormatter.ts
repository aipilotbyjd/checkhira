
export const formatIndianNumber = (num: number): string => {
  const absoluteNum = Math.abs(num);
  if (absoluteNum >= 10000000) { // Crore
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (absoluteNum >= 100000) { // Lakh
    return `₹${(num / 100000).toFixed(2)} L`;
  } else if (absoluteNum >= 1000) { // Thousand
    return `₹${(num / 1000).toFixed(2)} K`;
  }
  return `₹${num.toFixed(2)}`;
};

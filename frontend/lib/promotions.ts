import { Package } from "@/src/types/package";

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getValidPromotions = (packages: Package[]) => {
  const today = getToday();

  return packages.filter((pkg) => (
    Boolean(pkg.date_available_start) &&
    (!pkg.date_available_end || pkg.date_available_end >= today)
  ));
};
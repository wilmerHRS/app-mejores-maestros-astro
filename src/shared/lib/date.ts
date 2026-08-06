export const formatDateRange = (startStr: string, endStr: string): string => {
  if (!startStr || !endStr) return "";
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");
  
  const startDay = start.getDate();
  const startMonth = start.toLocaleDateString("es-ES", { month: "long" });
  const endDay = end.getDate();
  const endMonth = end.toLocaleDateString("es-ES", { month: "long" });
  const endYear = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startDay} al ${endDay} de ${startMonth} de ${endYear}`;
  }

  return `${startDay} de ${startMonth} - ${endDay} de ${endMonth} de ${endYear}`;
};

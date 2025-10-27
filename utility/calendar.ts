export const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const convertDateToMonthString = (date: String): string => {
  const monthIndex = date.split("-")[1];
  return MONTHS_SHORT[Number(monthIndex) - 1];
};

export const daysTillEndOfMonth = (month: number) => {
  const today = new Date();
  const endOfMonth = new Date(new Date().getFullYear(), month + 1, 0).getDate();

  if (today.getMonth() > month) {
    return 0;
  } else {
    return endOfMonth - today.getDate();
  }
};

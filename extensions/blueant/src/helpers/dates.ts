/** Prepends a zero to the given value if it is less than 10. */
export const leadingZero = (value: number) => (value < 10 ? `0${value}` : value);

/** Returns a string representation of the given date in the format 'YYYY-MM-DD'. */
export const getDateString = (date: Date) => {
  return [date.getFullYear(), leadingZero(date.getMonth() + 1), leadingZero(date.getDate())].join("-");
};

/** Checks if the given date is today. */
export const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

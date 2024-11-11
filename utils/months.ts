import { Month } from "@prisma/client";
import { getMonth, eachMonthOfInterval, format } from "date-fns";

export const memoizedMonthArray = (() => {
  let cachedResult: Month[number][];

  return () => {
    if (cachedResult) {
      return cachedResult;
    }

    const currentYear = new Date().getFullYear();

    cachedResult = eachMonthOfInterval({
      start: new Date(currentYear, 0, 1),
      end: new Date(currentYear, 11, 31),
    }).map((date) => format(date, "MMMM"));

    return cachedResult;
  };
})();

import dayjs from "dayjs";

function manipulateDate(
  operation: "add" | "subtract",
  currentDate: Date,
  value: number,
  metric: dayjs.ManipulateType,
): { dateFormat: Date; dayjsFormat: dayjs.Dayjs } {
  const dayjsDate = dayjs(currentDate);

  let newDate: dayjs.Dayjs;

  if (operation === "add") newDate = dayjsDate.add(value, metric);
  else newDate = dayjsDate.subtract(value, metric);

  return { dateFormat: new Date(newDate.format()), dayjsFormat: newDate };
}

export { manipulateDate };

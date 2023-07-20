import moment from "moment";

export const datesToDue = (date: string) => {
  const eventDate = moment(date);
  const today = moment();
  return eventDate.diff(today, "days");
};

export const hasOverdue = (issue: any) => {
  const exist = issue.labels.find((it: any) => {
    return it.name === "Overdue";
  })

  console.log("has overdue", exist);
  return exist;
}

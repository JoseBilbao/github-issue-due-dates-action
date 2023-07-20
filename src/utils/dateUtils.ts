import moment from "moment";

export const datesToDue = (date: string) => {
  const eventDate = moment(date);
  const today = moment();
  return eventDate.diff(today, "days");
};

export const hasLabel = (issue: any, label: string) => {
  const exist = issue.labels.find((it: any) => {
    return it.name === label;
  })

  console.log("has " + label, exist);
  return exist;
}

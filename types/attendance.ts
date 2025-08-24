export type Attendance = {
  id: string;
  date: string;
  status: "Present" | "Absent";
};

export type Reminder = {
  id: string;
  reminderDate: string;
};

export const TARGET_TIMEZONE = "America/New_York"; // US Eastern Time (EST/EDT)

export const TIME_OF_DAY_BUCKETS = {
  MORNING: { startHour: 5, endHour: 11, endMinute: 59, label: "Morning (5:00–11:59am)" },
  MIDDAY: { startHour: 12, endHour: 16, endMinute: 59, label: "Midday (12:00–4:59pm)" },
  NIGHT: { startHour: 17, endHour: 4, endMinute: 59, label: "Night (5:00pm–4:59am)" },
};

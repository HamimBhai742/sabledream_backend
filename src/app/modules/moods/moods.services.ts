import { prisma } from '../../lib/prisma';

function getNewYorkDateString(dateInput: Date | string | number): string {
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }
  const date = new Date(dateInput);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const partMap: Record<string, string> = {};
  parts.forEach(p => { partMap[p.type] = p.value; });
  return `${partMap.year}-${partMap.month}-${partMap.day}`;
}

function getNewYorkDayOfWeek(dateInput: Date | string | number): number {
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0);
    return date.getDay();
  }
  const date = new Date(dateInput);
  const dayStr = date.toLocaleString("en-US", { timeZone: "America/New_York", weekday: "short" });
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.indexOf(dayStr);
}

const createOrUpdateMood = async (userId: string, data: { energy: string; activities: string[]; date: string }) => {
  const nyDateStr = getNewYorkDateString(data.date);
  const moodDate = new Date(`${nyDateStr}T00:00:00.000Z`);

  return await prisma.mood.upsert({
    where: {
      userId_date: {
        userId,
        date: moodDate,
      },
    },
    update: {
      energy: data.energy,
      activities: data.activities,
    },
    create: {
      userId,
      energy: data.energy,
      activities: data.activities,
      date: moodDate,
    },
  });
};

const getMoodByDate = async (userId: string, date: string) => {
  const nyDateStr = getNewYorkDateString(date);
  const moodDate = new Date(`${nyDateStr}T00:00:00.000Z`);

  return await prisma.mood.findUnique({
    where: {
      userId_date: {
        userId,
        date: moodDate,
      },
    },
  });
};

const getMoodsByDateRange = async (userId: string, startDate: string, endDate: string) => {
  const startNy = getNewYorkDateString(startDate);
  const endNy = getNewYorkDateString(endDate);

  return await prisma.mood.findMany({
    where: {
      userId,
      date: {
        gte: new Date(`${startNy}T00:00:00.000Z`),
        lte: new Date(`${endNy}T23:59:59.999Z`),
      },
    },
    orderBy: {
      date: 'asc',
    },
  });
};

const getMoodsByMonth = async (userId: string, year: number, month: number) => {
  const startMonthStr = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endMonthStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const startDate = new Date(`${startMonthStr}T00:00:00.000Z`);
  const endDate = new Date(`${endMonthStr}T23:59:59.999Z`);

  return await prisma.mood.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });
};

const getMoodHistory = async (userId: string) => {
  const today = new Date();
  const todayNYStr = getNewYorkDateString(today);
  const todayNYUtc = new Date(`${todayNYStr}T00:00:00.000Z`);
  
  const dayOfWeek = getNewYorkDayOfWeek(today); // 0 (Sun) to 6 (Sat)
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const startOfWeek = new Date(todayNYUtc);
  startOfWeek.setUTCDate(todayNYUtc.getUTCDate() - daysToSubtract);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);

  const weeklyMoods = await prisma.mood.findMany({
    where: {
      userId,
      date: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  // 2. Recent 10 entries for the list
  const recentEntries = await prisma.mood.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: 'desc',
    },
    take: 10,
  });

  const getFeelingType = (energy: string) => {
    const lowerEnergy = energy.toLowerCase();
    const lowMoods = ['sad', 'angry', 'overwhelmed', 'anxious'];
    const calmMoods = ['calm', 'sat', 'clam'];

    if (lowMoods.includes(lowerEnergy)) return 'Low';
    if (calmMoods.includes(lowerEnergy)) return 'Clam';
    return 'High';
  };

  const mapMoodWithType = (mood: any) => ({
    ...mood,
    feelingType: getFeelingType(mood.energy),
    day: new Date(mood.date).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'short' }),
  });

  return {
    weeklyMoods: weeklyMoods.map(mapMoodWithType),
    recentEntries: recentEntries.map(mapMoodWithType),
  };
};

export const MoodService = {
  createOrUpdateMood,
  getMoodByDate,
  getMoodsByDateRange,
  getMoodHistory,
  getMoodsByMonth
};

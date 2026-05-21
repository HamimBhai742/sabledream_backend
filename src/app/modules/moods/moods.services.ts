import { prisma } from '../../lib/prisma';

const createOrUpdateMood = async (userId: string, data: { energy: string; activities: string[]; date: string }) => {
  const moodDate = new Date(data.date);
  // Normalize date to start of day to ensure one entry per day
  moodDate.setHours(0, 0, 0, 0);

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
  const moodDate = new Date(date);
  moodDate.setHours(0, 0, 0, 0);

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
  return await prisma.mood.findMany({
    where: {
      userId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    orderBy: {
      date: 'asc',
    },
  });
};

const getMoodsByMonth = async (userId: string, year: number, month: number) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

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
  // 1. Current Week Data (Monday to Sunday) for the chart
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
  // Calculate Monday of the current week
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
  
  const startOfWeek = new Date(new Date().setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

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
    const calmMoods = ['calm', 'sat', 'clam']; // images showed 'clam' or 'sat'

    if (lowMoods.includes(lowerEnergy)) return 'Low';
    if (calmMoods.includes(lowerEnergy)) return 'Clam';
    return 'High';
  };

  const mapMoodWithType = (mood: any) => ({
    ...mood,
    feelingType: getFeelingType(mood.energy),
    day: new Date(mood.date).toLocaleDateString('en-US', { weekday: 'short' }),
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

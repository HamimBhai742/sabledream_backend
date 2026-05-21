import { prisma } from "../../lib/prisma";

const getUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      provider: true,
      role: true,
      status: true,
      isVerified: true,
      image: true,
      phone: true,
      location: true,
      personalizationEnabled: true,
      analyticsEnabled: true,
      crashReportsEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const getJournals = async () => {
  return await prisma.journal.findMany({
    include: {
      categories: true,
    },
  });
};

const getAffirmations = async () => {
  return await prisma.affirmation.findMany();
};

const getMoods = async () => {
  return await prisma.mood.findMany();
};

const getPublicData = async () => {
  const [users, journals, affirmations, moods] = await Promise.all([
    getUsers(),
    getJournals(),
    getAffirmations(),
    getMoods(),
  ]);

  return {
    users,
    journals,
    affirmations,
    moods,
  };
};

export const PublicDataService = {
  getUsers,
  getJournals,
  getAffirmations,
  getMoods,
  getPublicData,
};

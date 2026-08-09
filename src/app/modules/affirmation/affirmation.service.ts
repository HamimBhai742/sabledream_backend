import { prisma } from "../../lib/prisma";
import AppError from "../../error/AppError";
import httpStatus from "http-status";

// Define the default seed affirmations matching the rich details and tags from user mockups
const DEFAULT_AFFIRMATIONS = [
  // Goal: LIFE IS GOOD. LIFE IS GREAT. APPRECIATE THE SMALL THINGS.
  {
    text: "Today I will be grateful for what I have",
    category: "Affirmation",
    goal: "LIFE IS GOOD. LIFE IS GREAT. APPRECIATE THE SMALL THINGS.",
    mood: "CALM",
    timeOfDay: "Morning",
    subStatements: [
      "I allow myself to slow down and fully arrive in this moment.",
      "I release the pressure to have everything figured out and trust that I am exactly where I need to be.",
      "With every breath, I feel more centred, more present, and more at peace within myself."
    ],
    tags: ["Calm", "Motivation"]
  },
  {
    text: "Every small positive thought I cultivate rewires my brain for joy.",
    category: "Affirmation",
    goal: "LIFE IS GOOD. LIFE IS GREAT. APPRECIATE THE SMALL THINGS.",
    mood: "HAPPY",
    timeOfDay: "Afternoon",
    subStatements: [
      "I choose to look at the world through a lens of appreciation.",
      "The beauty of life is hidden in the smallest details, and I am here to witness it.",
      "My heart is full of gratitude for this day."
    ],
    tags: ["Happy", "Joy"]
  },

  // Goal: save animals
  {
    text: "I speak for those who cannot, extending love and kindness to all living beings.",
    category: "Affirmation",
    goal: "save animals",
    mood: "CALM",
    timeOfDay: "Morning",
    subStatements: [
      "I walk gently on this earth, showing compassion to all creatures.",
      "My heart expands to protect and love the animal kingdom.",
      "Every life is precious, and I stand for their safety and peace."
    ],
    tags: ["Compassion", "Calm"]
  },
  {
    text: "All creatures deserve to live free from suffering, and I choose to protect them.",
    category: "Affirmation",
    goal: "save animals",
    mood: "GRATEFUL",
    timeOfDay: "Evening",
    subStatements: [
      "I make conscious choices that honor the lives of all animals.",
      "I am an advocate for the voiceless and a builder of harmony.",
      "Together with all living beings, we share this beautiful home."
    ],
    tags: ["Nature", "Harmony"]
  },

  // Goal: How to overcome anxiety
  {
    text: "I am safe in this moment, breathing in calm and releasing all my tension.",
    category: "Affirmation",
    goal: "How to overcome anxiety",
    mood: "ANXIOUS",
    timeOfDay: "Morning",
    subStatements: [
      "I allow my breath to settle into a natural, soothing rhythm.",
      "I am stronger than my anxious thoughts, and this feeling will pass.",
      "I anchor myself in the present moment where I am safe and secure."
    ],
    tags: ["Calm", "Relaxation"]
  },
  {
    text: "My mind is settling down, and I choose peaceful thoughts over anxious worries.",
    category: "Affirmation",
    goal: "How to overcome anxiety",
    mood: "ANXIOUS",
    timeOfDay: "Afternoon",
    subStatements: [
      "I release the need to control the future and find solace in the now.",
      "I trust my inner strength to guide me through any wave of emotion.",
      "I choose serenity and peace with every exhale."
    ],
    tags: ["Mindfulness", "Peace"]
  },
  {
    text: "With each gentle breath, I am rewiring my mind to be perfectly calm, safe, and secure.",
    category: "Affirmation",
    goal: "How to overcome anxiety",
    mood: "CALM",
    timeOfDay: "Night",
    subStatements: [
      "My nervous system is cooling down and finding its natural balance.",
      "I am supported by the ground beneath me and the space around me.",
      "I release the day and let peace wash over me."
    ],
    tags: ["Calm", "Sleep"]
  },

  // Goal: Make place
  {
    text: "I create a sacred space around me, allowing my true potential to expand.",
    category: "Affirmation",
    goal: "Make place",
    mood: "CALM",
    timeOfDay: "Morning",
    subStatements: [
      "I clear away the old to welcome new, positive beginnings.",
      "My space is a reflection of my inner peace, clarity, and focus.",
      "I am worthy of an environment that nurtures my highest self."
    ],
    tags: ["Growth", "Clarity"]
  },
  {
    text: "I am clearing out clutter to make room for abundance, joy, and peace in my life.",
    category: "Affirmation",
    goal: "Make place",
    mood: "HAPPY",
    timeOfDay: "Afternoon",
    subStatements: [
      "I release attachment to things that no longer serve my journey.",
      "I am opening up channels of abundance and limitless creativity.",
      "Every new space I create brings fresh energy and inspiration."
    ],
    tags: ["Abundance", "Cleanse"]
  }
];

const seedAffirmations = async () => {
  const count = await prisma.affirmation.count();
  if (count === 0) {
    await prisma.affirmation.createMany({
      data: DEFAULT_AFFIRMATIONS,
    });
  }
};

const formatAffirmation = (affirmation: any) => ({
  ...affirmation,
  reflection: {
    title: "Reflection",
    text: affirmation.goal,
  },
  affirmation: {
    title: "Affirmation",
    text: affirmation.text,
    subStatements: affirmation.subStatements,
    tags: affirmation.tags,
  },
  detailTitle: "Affirmation",
});

const groupAffirmationsByReflection = (affirmations: any[]) => {
  const grouped: Record<string, { goal: string; reflection: string; count: number; items: any[] }> = {};

  for (const affirmation of affirmations) {
    const reflection = affirmation.goal;
    if (!grouped[reflection]) {
      grouped[reflection] = {
        goal: reflection,
        reflection,
        count: 0,
        items: [],
      };
    }

    grouped[reflection].count += 1;
    grouped[reflection].items.push(formatAffirmation(affirmation));
  }

  return Object.values(grouped);
};

const getAllAffirmations = async (filters: {
  category?: string;
  goal?: string;
  mood?: string;
  timeOfDay?: string;
  search?: string;
}) => {
  // Automatically run seeder if database is empty
  await seedAffirmations();

  const whereClause: any = {};
  if (filters.category) whereClause.category = filters.category;
  if (filters.goal) whereClause.goal = filters.goal;
  if (filters.mood) whereClause.mood = filters.mood;
  if (filters.timeOfDay) whereClause.timeOfDay = filters.timeOfDay;
  if (filters.search) {
    whereClause.OR = [
      { text: { contains: filters.search, mode: "insensitive" } },
      { goal: { contains: filters.search, mode: "insensitive" } },
      { category: { contains: filters.search, mode: "insensitive" } },
      { mood: { contains: filters.search, mode: "insensitive" } },
      { timeOfDay: { contains: filters.search, mode: "insensitive" } },
      { tags: { has: filters.search } },
    ];
  }

  const affirmations = await prisma.affirmation.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return {
    total: affirmations.length,
    raw: affirmations.map(formatAffirmation),
    grouped: groupAffirmationsByReflection(affirmations),
  };
};

const getTodayAffirmation = async () => {
  // Automatically run seeder if database is empty
  await seedAffirmations();

  // Check today's daily reflection first
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const year = today.getFullYear();
  const targetDate = `${month}/${day}/${year}`;

  try {
    const dailyReflection = await prisma.dailyReflection.findUnique({
      where: { date: targetDate },
    });

    if (dailyReflection) {
      const subStatements = [
        dailyReflection.journalPrompt1,
        dailyReflection.journalPrompt2,
      ].filter(Boolean);

      // Find or create a corresponding Affirmation in the Affirmation table
      let matchedAffirmation = await prisma.affirmation.findFirst({
        where: {
          text: dailyReflection.affirmation,
          goal: dailyReflection.reflection,
        },
      });

      if (!matchedAffirmation) {
        matchedAffirmation = await prisma.affirmation.create({
          data: {
            text: dailyReflection.affirmation,
            category: "Affirmation",
            goal: dailyReflection.reflection,
            mood: "CALM",
            timeOfDay: "Morning",
            subStatements,
            tags: ["Daily"],
          },
        });
      }

      return {
        id: matchedAffirmation.id,
        text: dailyReflection.affirmation,
        category: "Affirmation",
        goal: dailyReflection.reflection,
        mood: "CALM",
        timeOfDay: "Morning",
        subStatements,
        tags: ["Daily"],
        reflection: {
          title: "Reflection",
          text: dailyReflection.reflection,
        },
        affirmation: {
          title: "Affirmation",
          text: dailyReflection.affirmation,
          subStatements,
          tags: ["Daily"],
        },
        detailTitle: "Affirmation",
      };
    }
  } catch (error) {
    console.error("Error fetching today's daily reflection:", error);
  }

  const affirmations = await prisma.affirmation.findMany();
  if (affirmations.length === 0) {
    return null;
  }

  // Pick deterministic affirmation per day using day of year
  const startOfYear = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = dayOfYear % affirmations.length;
  return formatAffirmation(affirmations[index]);
};

const saveAffirmation = async (userId: string, affirmationId: string) => {
  let targetAffirmationId = affirmationId;

  let affirmation = await prisma.affirmation.findUnique({
    where: { id: affirmationId },
  });

  if (!affirmation) {
    // Check if it's a daily reflection
    const dailyReflection = await prisma.dailyReflection.findUnique({
      where: { id: affirmationId },
    });

    if (dailyReflection) {
      // Find or create a corresponding Affirmation record
      let matchedAffirmation = await prisma.affirmation.findFirst({
        where: {
          text: dailyReflection.affirmation,
          goal: dailyReflection.reflection,
        },
      });

      if (!matchedAffirmation) {
        matchedAffirmation = await prisma.affirmation.create({
          data: {
            text: dailyReflection.affirmation,
            category: "Affirmation",
            goal: dailyReflection.reflection,
            mood: "CALM",
            timeOfDay: "Morning",
            subStatements: [
              dailyReflection.journalPrompt1,
              dailyReflection.journalPrompt2,
            ].filter(Boolean),
            tags: ["Daily"],
          },
        });
      }
      targetAffirmationId = matchedAffirmation.id;
    } else {
      throw new AppError(httpStatus.NOT_FOUND, "Affirmation not found");
    }
  }

  // Check if already saved
  const existingSaved = await prisma.savedAffirmation.findUnique({
    where: {
      userId_affirmationId: {
        userId,
        affirmationId: targetAffirmationId,
      },
    },
  });

  if (existingSaved) {
    return { message: "Affirmation already saved", saved: true };
  }

  await prisma.savedAffirmation.create({
    data: {
      userId,
      affirmationId: targetAffirmationId,
    },
  });

  return { message: "Affirmation saved successfully", saved: true };
};

const unsaveAffirmation = async (userId: string, affirmationId: string) => {
  let targetAffirmationId = affirmationId;

  const affirmation = await prisma.affirmation.findUnique({
    where: { id: affirmationId },
  });

  if (!affirmation) {
    // Check if it's a daily reflection
    const dailyReflection = await prisma.dailyReflection.findUnique({
      where: { id: affirmationId },
    });

    if (dailyReflection) {
      const matchedAffirmation = await prisma.affirmation.findFirst({
        where: {
          text: dailyReflection.affirmation,
          goal: dailyReflection.reflection,
        },
      });

      if (matchedAffirmation) {
        targetAffirmationId = matchedAffirmation.id;
      }
    }
  }

  const existingSaved = await prisma.savedAffirmation.findUnique({
    where: {
      userId_affirmationId: {
        userId,
        affirmationId: targetAffirmationId,
      },
    },
  });

  if (!existingSaved) {
    throw new AppError(httpStatus.NOT_FOUND, "Saved affirmation record not found");
  }

  await prisma.savedAffirmation.delete({
    where: {
      userId_affirmationId: {
        userId,
        affirmationId: targetAffirmationId,
      },
    },
  });

  return { message: "Affirmation removed from saved list successfully", saved: false };
};

const getSavedAffirmations = async (
  userId: string,
  filters: {
    category?: string;
    goal?: string;
    mood?: string;
    timeOfDay?: string;
  }
) => {
  // Sync seed if empty
  await seedAffirmations();

  const whereClause: any = { userId };

  // Filter inside the nested relation
  if (filters.category || filters.goal || filters.mood || filters.timeOfDay) {
    whereClause.affirmation = {};
    if (filters.category) whereClause.affirmation.category = filters.category;
    if (filters.goal) whereClause.affirmation.goal = filters.goal;
    if (filters.mood) whereClause.affirmation.mood = filters.mood;
    if (filters.timeOfDay) whereClause.affirmation.timeOfDay = filters.timeOfDay;
  }

  const saved = await prisma.savedAffirmation.findMany({
    where: whereClause,
    include: {
      affirmation: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const affirmations = saved.map((s) => s.affirmation);

  return {
    total: saved.length,
    raw: affirmations.map(formatAffirmation),
    grouped: groupAffirmationsByReflection(affirmations),
  };
};

const createAffirmation = async (data: {
  text: string;
  category: string;
  goal: string;
  mood: string;
  timeOfDay: string;
  subStatements?: string[];
  tags?: string[];
}) => {
  if (!data.text || !data.category || !data.goal || !data.mood || !data.timeOfDay) {
    throw new AppError(httpStatus.BAD_REQUEST, "All fields are required to create an affirmation");
  }

  const affirmation = await prisma.affirmation.create({
    data,
  });

  return formatAffirmation(affirmation);
};

const getAffirmationById = async (id: string) => {
  const affirmation = await prisma.affirmation.findUnique({
    where: { id },
  });

  if (!affirmation) {
    throw new AppError(httpStatus.NOT_FOUND, "Affirmation not found");
  }

  return formatAffirmation(affirmation);
};

const updateAffirmation = async (
  id: string,
  data: Partial<{
    text: string;
    category: string;
    goal: string;
    mood: string;
    timeOfDay: string;
    subStatements: string[];
    tags: string[];
  }>,
) => {
  const existing = await prisma.affirmation.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Affirmation not found");
  }

  const updatedAffirmation = await prisma.affirmation.update({
    where: { id },
    data: {
      ...(data.text !== undefined ? { text: data.text } : {}),
      ...(data.category !== undefined ? { category: data.category } : {}),
      ...(data.goal !== undefined ? { goal: data.goal } : {}),
      ...(data.mood !== undefined ? { mood: data.mood } : {}),
      ...(data.timeOfDay !== undefined ? { timeOfDay: data.timeOfDay } : {}),
      ...(data.subStatements !== undefined ? { subStatements: data.subStatements } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
    },
  });

  return formatAffirmation(updatedAffirmation);
};

const deleteAffirmation = async (id: string) => {
  const existing = await prisma.affirmation.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Affirmation not found");
  }

  await prisma.affirmation.delete({ where: { id } });
  return null;
};

export const AffirmationService = {
  getAllAffirmations,
  getTodayAffirmation,
  saveAffirmation,
  unsaveAffirmation,
  getSavedAffirmations,
  createAffirmation,
  getAffirmationById,
  updateAffirmation,
  deleteAffirmation,
};

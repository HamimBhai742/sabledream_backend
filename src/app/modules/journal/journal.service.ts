import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import {
  deleteFromCloudinary,
  uploadBufferToCloudinary,
} from "../../utils/uploadCloudinary";
import AppError from "../../error/AppError";
import httpStatus from "http-status";
import {
  buildJournalWhereFilter,
  getJournalOrderBy,
  getPagination,
} from "../../helper/journal";
import { TJournalQuery } from "../../interface/journal.interface";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

type CreateJournalPayload = {
  title: string;
  prompt?: string;
  content?: string;
  mood?:
    | "HAPPY"
    | "SAD"
    | "CALM"
    | "GRATEFUL"
    | "ANXIOUS"
    | "EXCITED"
    | "NEUTRAL";
  status?: "DRAFT" | "PUBLISHED";
  categoryIds?: string[];
};

type UpdateJournalPayload = Partial<CreateJournalPayload> & {
  isFavorite?: boolean;
  isArchived?: boolean;
};

const createJournal = async (
  userId: string,
  payload: any,
  file?: Express.Multer.File,
) => {
  const data = typeof payload.data === "string" ? JSON.parse(payload.data) : payload;
  const { categoryIds = [], ...journalData } = data;

  if (categoryIds.length) {
    const categories = await prisma.journalCategory.findMany({
      where: {
        id: {
          in: categoryIds,
        },
        userId,
      },
      select: {
        id: true,
      },
    });

    if (categories.length !== categoryIds.length) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid category selected");
    }
  }

  let imageUrl: string | undefined;
  let imageKey: string | undefined;

  if (file) {
    const uploadedImage = await uploadBufferToCloudinary(
      file.buffer,
      "journals",
    );

    imageUrl = uploadedImage.secure_url;
    imageKey = uploadedImage.public_id;
  }

  const journal = await prisma.journal.create({
    data: {
      ...journalData,
      userId,
      imageUrl,
      imageKey,
      categoryIds,
    },
    include: {
      categories: true,
    },
  });

  if (categoryIds.length) {
    await prisma.journalCategory.updateMany({
      where: {
        id: {
          in: categoryIds,
        },
        userId,
      },
      data: {
        journalIds: {
          push: journal.id,
        },
      },
    });
  }

  return journal;
};

const getMyJournals = async (userId: string, query: TJournalQuery) => {
  const { page, limit, skip } = getPagination(query);

  const where = buildJournalWhereFilter(query, userId);

  const orderBy = getJournalOrderBy(query.sortBy);

  const [journals, total] = await Promise.all([
    prisma.journal.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        categories: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),

    prisma.journal.count({
      where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: journals,
  };
};

const getAllJournals = async (query: TJournalQuery) => {
  const { page, limit, skip } = getPagination(query);

  const where = buildJournalWhereFilter(query);

  const orderBy = getJournalOrderBy(query.sortBy);

  const [journals, total] = await Promise.all([
    prisma.journal.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        categories: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),

    prisma.journal.count({
      where,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: journals,
  };
};

const getJournalById = async (userId: string, journalId: string) => {
  const journal = await prisma.journal.findFirst({
    where: {
      id: journalId,
      userId,
    },
    include: {
      categories: true,
    },
  });

  if (!journal) {
    throw new Error("Journal not found");
  }

  return journal;
};

const updateJournal = async (
  userId: string,
  journalId: string,
  payload: any,
  file?: Express.Multer.File,
) => {
  const existingJournal = await prisma.journal.findFirst({
    where: {
      id: journalId,
      userId,
    },
  });

  if (!existingJournal) {
    throw new Error("Journal not found");
  }

  const data = typeof payload.data === "string" ? JSON.parse(payload.data) : payload;
  const { categoryIds, ...journalData } = data;

  if (categoryIds?.length) {
    const categories = await prisma.journalCategory.findMany({
      where: {
        id: {
          in: categoryIds,
        },
        userId,
      },
      select: {
        id: true,
      },
    });

    if (categories.length !== categoryIds.length) {
      throw new Error("Invalid category selected");
    }
  }

  let imageUrl = existingJournal.imageUrl;
  let imageKey = existingJournal.imageKey;

  if (file) {
    if (existingJournal.imageKey) {
      await deleteFromCloudinary(existingJournal.imageKey);
    }

    const uploadedImage = await uploadBufferToCloudinary(
      file.buffer,
      "journals",
    );

    imageUrl = uploadedImage.secure_url;
    imageKey = uploadedImage.public_id;
  }

  const updatedJournal = await prisma.journal.update({
    where: {
      id: journalId,
    },
    data: {
      ...journalData,
      imageUrl,
      imageKey,
      categoryIds: categoryIds ?? existingJournal.categoryIds,
    },
    include: {
      categories: true,
    },
  });

  if (categoryIds) {
    const oldCategoryIds = existingJournal.categoryIds;
    const newCategoryIds = categoryIds;

    const removedCategoryIds = oldCategoryIds.filter(
      (id) => !newCategoryIds.includes(id),
    );

    const addedCategoryIds = newCategoryIds.filter(
      (id: string) => !oldCategoryIds.includes(id),
    );

    for (const categoryId of removedCategoryIds) {
      const category = await prisma.journalCategory.findFirst({
        where: {
          id: categoryId,
          userId,
        },
      });

      if (category) {
        await prisma.journalCategory.update({
          where: {
            id: categoryId,
          },
          data: {
            journalIds: category.journalIds.filter((id) => id !== journalId),
          },
        });
      }
    }

    if (addedCategoryIds.length) {
      await prisma.journalCategory.updateMany({
        where: {
          id: {
            in: addedCategoryIds,
          },
          userId,
        },
        data: {
          journalIds: {
            push: journalId,
          },
        },
      });
    }
  }

  return updatedJournal;
};

const deleteJournal = async (userId: string, journalId: string) => {
  const journal = await prisma.journal.findFirst({
    where: {
      id: journalId,
      userId,
    },
  });

  if (!journal) {
    throw new AppError(httpStatus.NOT_FOUND, "Journal not found");
  }

  if (journal.imageKey) {
    await deleteFromCloudinary(journal.imageKey);
  }

  await prisma.$transaction(async (tx) => {
    for (const categoryId of journal.categoryIds) {
      const category = await tx.journalCategory.findFirst({
        where: {
          id: categoryId,
          userId,
        },
      });

      if (category) {
        await tx.journalCategory.update({
          where: {
            id: categoryId,
          },
          data: {
            journalIds: category.journalIds.filter((id) => id !== journalId),
          },
        });
      }
    }

    await tx.journal.delete({
      where: {
        id: journalId,
      },
    });
  });

  return null;
};

const toggleFavorite = async (userId: string, journalId: string) => {
  const journal = await prisma.journal.findFirst({
    where: {
      id: journalId,
      userId,
    },
  });

  if (!journal) {
    throw new AppError(httpStatus.NOT_FOUND, "Journal not found");
  }

  return prisma.journal.update({
    where: {
      id: journalId,
    },
    data: {
      isFavorite: !journal.isFavorite,
    },
    include: {
      categories: true,
    },
  });
};

const archiveJournal = async (userId: string, journalId: string) => {
  const journal = await prisma.journal.findFirst({
    where: {
      id: journalId,
      userId,
    },
  });

  if (!journal) {
    throw new AppError(httpStatus.NOT_FOUND, "Journal not found");
  }

  return prisma.journal.update({
    where: {
      id: journalId,
    },
    data: {
      isArchived: true,
    },
  });
};

const createCategory = async (userId: string, name: string) => {
  const slug = slugify(name);

  return prisma.journalCategory.upsert({
    where: {
      userId_slug: {
        userId,
        slug,
      },
    },
    update: {},
    create: {
      userId,
      name,
      slug,
    },
  });
};

const getMyCategories = async (userId: string) => {
  return prisma.journalCategory.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const JournalService = {
  createJournal,
  getMyJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
  toggleFavorite,
  archiveJournal,
  createCategory,
  getMyCategories,
  getAllJournals
};

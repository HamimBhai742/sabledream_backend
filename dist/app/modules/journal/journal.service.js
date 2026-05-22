"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalService = void 0;
const prisma_1 = require("../../lib/prisma");
const uploadCloudinary_1 = require("../../utils/uploadCloudinary");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const journal_1 = require("../../helper/journal");
const slugify = (text) => text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
const createJournal = (userId, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const data = typeof payload.data === "string" ? JSON.parse(payload.data) : payload;
    const { categoryIds = [] } = data, journalData = __rest(data, ["categoryIds"]);
    if (categoryIds.length) {
        const categories = yield prisma_1.prisma.journalCategory.findMany({
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
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid category selected");
        }
    }
    let imageUrl;
    let imageKey;
    if (file) {
        const uploadedImage = yield (0, uploadCloudinary_1.uploadBufferToCloudinary)(file.buffer, "journals");
        imageUrl = uploadedImage.secure_url;
        imageKey = uploadedImage.public_id;
    }
    const journal = yield prisma_1.prisma.journal.create({
        data: Object.assign(Object.assign({}, journalData), { userId,
            imageUrl,
            imageKey,
            categoryIds }),
        include: {
            categories: true,
        },
    });
    if (categoryIds.length) {
        yield prisma_1.prisma.journalCategory.updateMany({
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
});
const getMyJournals = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(userId, query);
    const { page, limit, skip } = (0, journal_1.getPagination)(query);
    const where = (0, journal_1.buildJournalWhereFilter)(query, userId);
    const orderBy = (0, journal_1.getJournalOrderBy)(query.sortBy);
    const [journals, total] = yield Promise.all([
        prisma_1.prisma.journal.findMany({
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
        prisma_1.prisma.journal.count({
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
});
const getAllJournals = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = (0, journal_1.getPagination)(query);
    const where = (0, journal_1.buildJournalWhereFilter)(query);
    const orderBy = (0, journal_1.getJournalOrderBy)(query.sortBy);
    const [journals, total] = yield Promise.all([
        prisma_1.prisma.journal.findMany({
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
        prisma_1.prisma.journal.count({
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
});
const getJournalById = (userId, journalId) => __awaiter(void 0, void 0, void 0, function* () {
    const journal = yield prisma_1.prisma.journal.findFirst({
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
});
const updateJournal = (userId, journalId, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const existingJournal = yield prisma_1.prisma.journal.findFirst({
        where: {
            id: journalId,
            userId,
        },
    });
    if (!existingJournal) {
        throw new Error("Journal not found");
    }
    const data = typeof payload.data === "string" ? JSON.parse(payload.data) : payload;
    const { categoryIds } = data, journalData = __rest(data, ["categoryIds"]);
    if (categoryIds === null || categoryIds === void 0 ? void 0 : categoryIds.length) {
        const categories = yield prisma_1.prisma.journalCategory.findMany({
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
            yield (0, uploadCloudinary_1.deleteFromCloudinary)(existingJournal.imageKey);
        }
        const uploadedImage = yield (0, uploadCloudinary_1.uploadBufferToCloudinary)(file.buffer, "journals");
        imageUrl = uploadedImage.secure_url;
        imageKey = uploadedImage.public_id;
    }
    const updatedJournal = yield prisma_1.prisma.journal.update({
        where: {
            id: journalId,
        },
        data: Object.assign(Object.assign({}, journalData), { imageUrl,
            imageKey, categoryIds: categoryIds !== null && categoryIds !== void 0 ? categoryIds : existingJournal.categoryIds }),
        include: {
            categories: true,
        },
    });
    if (categoryIds) {
        const oldCategoryIds = existingJournal.categoryIds;
        const newCategoryIds = categoryIds;
        const removedCategoryIds = oldCategoryIds.filter((id) => !newCategoryIds.includes(id));
        const addedCategoryIds = newCategoryIds.filter((id) => !oldCategoryIds.includes(id));
        for (const categoryId of removedCategoryIds) {
            const category = yield prisma_1.prisma.journalCategory.findFirst({
                where: {
                    id: categoryId,
                    userId,
                },
            });
            if (category) {
                yield prisma_1.prisma.journalCategory.update({
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
            yield prisma_1.prisma.journalCategory.updateMany({
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
});
const deleteJournal = (userId, journalId) => __awaiter(void 0, void 0, void 0, function* () {
    const journal = yield prisma_1.prisma.journal.findFirst({
        where: {
            id: journalId,
            userId,
        },
    });
    if (!journal) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Journal not found");
    }
    if (journal.imageKey) {
        yield (0, uploadCloudinary_1.deleteFromCloudinary)(journal.imageKey);
    }
    yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        for (const categoryId of journal.categoryIds) {
            const category = yield tx.journalCategory.findFirst({
                where: {
                    id: categoryId,
                    userId,
                },
            });
            if (category) {
                yield tx.journalCategory.update({
                    where: {
                        id: categoryId,
                    },
                    data: {
                        journalIds: category.journalIds.filter((id) => id !== journalId),
                    },
                });
            }
        }
        yield tx.journal.delete({
            where: {
                id: journalId,
            },
        });
    }));
    return null;
});
const toggleFavorite = (userId, journalId) => __awaiter(void 0, void 0, void 0, function* () {
    const journal = yield prisma_1.prisma.journal.findFirst({
        where: {
            id: journalId,
            userId,
        },
    });
    if (!journal) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Journal not found");
    }
    return prisma_1.prisma.journal.update({
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
});
const archiveJournal = (userId, journalId) => __awaiter(void 0, void 0, void 0, function* () {
    const journal = yield prisma_1.prisma.journal.findFirst({
        where: {
            id: journalId,
            userId,
        },
    });
    if (!journal) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Journal not found");
    }
    return prisma_1.prisma.journal.update({
        where: {
            id: journalId,
        },
        data: {
            isArchived: true,
        },
    });
});
const createCategory = (userId, name) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = slugify(name);
    return prisma_1.prisma.journalCategory.upsert({
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
});
const getMyCategories = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(userId);
    return prisma_1.prisma.journalCategory.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "asc",
        },
    });
});
exports.JournalService = {
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

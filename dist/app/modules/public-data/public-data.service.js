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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicDataService = void 0;
const prisma_1 = require("../../lib/prisma");
const getUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.user.findMany({
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
});
const getJournals = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.journal.findMany({
        include: {
            categories: true,
        },
    });
});
const getAffirmations = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.affirmation.findMany();
});
const getMoods = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.mood.findMany();
});
const getPublicData = () => __awaiter(void 0, void 0, void 0, function* () {
    const [users, journals, affirmations, moods] = yield Promise.all([
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
});
exports.PublicDataService = {
    getUsers,
    getJournals,
    getAffirmations,
    getMoods,
    getPublicData,
};

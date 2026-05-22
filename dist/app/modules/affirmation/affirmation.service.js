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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AffirmationService = void 0;
const prisma_1 = require("../../lib/prisma");
const AppError_1 = __importDefault(require("../../error/AppError"));
const http_status_1 = __importDefault(require("http-status"));
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
const seedAffirmations = () => __awaiter(void 0, void 0, void 0, function* () {
    const count = yield prisma_1.prisma.affirmation.count();
    if (count === 0) {
        yield prisma_1.prisma.affirmation.createMany({
            data: DEFAULT_AFFIRMATIONS,
        });
        console.log(`[SEED] Seeded ${DEFAULT_AFFIRMATIONS.length} affirmations successfully.`);
    }
});
const getAllAffirmations = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    // Automatically run seeder if database is empty
    yield seedAffirmations();
    const whereClause = {};
    if (filters.category)
        whereClause.category = filters.category;
    if (filters.goal)
        whereClause.goal = filters.goal;
    if (filters.mood)
        whereClause.mood = filters.mood;
    if (filters.timeOfDay)
        whereClause.timeOfDay = filters.timeOfDay;
    const affirmations = yield prisma_1.prisma.affirmation.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
    });
    return affirmations;
});
const getTodayAffirmation = () => __awaiter(void 0, void 0, void 0, function* () {
    // Automatically run seeder if database is empty
    yield seedAffirmations();
    const affirmations = yield prisma_1.prisma.affirmation.findMany();
    if (affirmations.length === 0) {
        return null;
    }
    // Pick deterministic affirmation per day using day of year
    const startOfYear = new Date(new Date().getFullYear(), 0, 0);
    const diff = Date.now() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const index = dayOfYear % affirmations.length;
    return affirmations[index];
});
const saveAffirmation = (userId, affirmationId) => __awaiter(void 0, void 0, void 0, function* () {
    const affirmation = yield prisma_1.prisma.affirmation.findUnique({
        where: { id: affirmationId },
    });
    if (!affirmation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Affirmation not found");
    }
    // Check if already saved
    const existingSaved = yield prisma_1.prisma.savedAffirmation.findUnique({
        where: {
            userId_affirmationId: {
                userId,
                affirmationId,
            },
        },
    });
    if (existingSaved) {
        return { message: "Affirmation already saved", saved: true };
    }
    yield prisma_1.prisma.savedAffirmation.create({
        data: {
            userId,
            affirmationId,
        },
    });
    return { message: "Affirmation saved successfully", saved: true };
});
const unsaveAffirmation = (userId, affirmationId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingSaved = yield prisma_1.prisma.savedAffirmation.findUnique({
        where: {
            userId_affirmationId: {
                userId,
                affirmationId,
            },
        },
    });
    if (!existingSaved) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Saved affirmation record not found");
    }
    yield prisma_1.prisma.savedAffirmation.delete({
        where: {
            userId_affirmationId: {
                userId,
                affirmationId,
            },
        },
    });
    return { message: "Affirmation removed from saved list successfully", saved: false };
});
const getSavedAffirmations = (userId, filters) => __awaiter(void 0, void 0, void 0, function* () {
    // Sync seed if empty
    yield seedAffirmations();
    const whereClause = { userId };
    // Filter inside the nested relation
    if (filters.category || filters.goal || filters.mood || filters.timeOfDay) {
        whereClause.affirmation = {};
        if (filters.category)
            whereClause.affirmation.category = filters.category;
        if (filters.goal)
            whereClause.affirmation.goal = filters.goal;
        if (filters.mood)
            whereClause.affirmation.mood = filters.mood;
        if (filters.timeOfDay)
            whereClause.affirmation.timeOfDay = filters.timeOfDay;
    }
    const saved = yield prisma_1.prisma.savedAffirmation.findMany({
        where: whereClause,
        include: {
            affirmation: true,
        },
        orderBy: { createdAt: "desc" },
    });
    // Group by Goal
    const grouped = {};
    for (const s of saved) {
        const goal = s.affirmation.goal;
        if (!grouped[goal]) {
            grouped[goal] = {
                goal,
                count: 0,
                items: [],
            };
        }
        grouped[goal].count += 1;
        grouped[goal].items.push(s.affirmation);
    }
    return {
        total: saved.length,
        raw: saved.map((s) => s.affirmation),
        grouped: Object.values(grouped),
    };
});
const createAffirmation = (data) => __awaiter(void 0, void 0, void 0, function* () {
    if (!data.text || !data.category || !data.goal || !data.mood || !data.timeOfDay) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "All fields are required to create an affirmation");
    }
    const affirmation = yield prisma_1.prisma.affirmation.create({
        data,
    });
    return affirmation;
});
const getAffirmationById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const affirmation = yield prisma_1.prisma.affirmation.findUnique({
        where: { id },
    });
    if (!affirmation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Affirmation not found");
    }
    return affirmation;
});
exports.AffirmationService = {
    getAllAffirmations,
    getTodayAffirmation,
    saveAffirmation,
    unsaveAffirmation,
    getSavedAffirmations,
    createAffirmation,
    getAffirmationById,
};

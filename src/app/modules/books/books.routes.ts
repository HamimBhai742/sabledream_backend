import { Router } from "express";
import { BooksController } from "./books.controller";

const router = Router();

router.get("/", BooksController.getBooks);
router.get("/:id", BooksController.getBookById);

export const BooksRoutes = router;

import express from "express";
import {
  getAllBooks,
  addBooks,
  updateBooks,
  deleteBooks,
  getBooks,
} from "../controllers/book.controller.js";
const router = express.Router();

router.get("/:toSearch", getBooks);
router.get("/", getAllBooks);
router.post("/", addBooks);
router.patch("/:bookId", updateBooks);
router.delete("/:bookId", deleteBooks);

export default router;

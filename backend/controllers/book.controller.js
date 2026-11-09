import Book from "../models/book.model.js";
import User from "../models/user.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getBooks = async (req, res) => {
  const { toSearch } = req.params;

  try {
    const book = await Book.find({ toSearch });

    res.status(200).json({
      book,
    });
  } catch (error) {
    console.error(`Error on fetching a book ${error.message}`);
    res.status(500).json({
      message: "Failed on Server, try again later.",
    });
  }
};

export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({});

    res.status(200).json({
      books,
    });
  } catch (error) {
    console.error(`error on retriving all data books ${error.message}`);
    res.status(500).json({
      message: "Server Error Please try again later",
    });
  }
};

export const addBooks = async (req, res) => {
  const {
    title,
    isbn,
    author,
    category,
    publisher,
    publishYear,
    description,
    shelfLocation,
    totalCopies,
    availableCopies,
    status,
    image,
  } = req.body;
  try {
    let cloudinaryResponse = null;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "LibSchool/books",
      });
    }

    const books = await User.create({
      title,
      isbn,
      author,
      category,
      publisher,
      publishYear,
      description,
      shelfLocation,
      totalCopies,
      availableCopies,
      status,
      imageUrl: cloudinaryResponse ? cloudinaryResponse.secure_url : null,
      imagePublicId: cloudinaryResponse ? cloudinaryResponse.public_id : null,
    });

    res.status(201).json({
      message: "Book added Successfully",
    });
  } catch (error) {
    console.error(`Error on creating books ${error.message}`);
    res
      .status(500)
      .json({ message: "Error on server, Please try again later." });
  }
};

export const updateBooks = async (req, res) => {
  const { bookId } = req.params;
  const {
    title,
    isbn,
    author,
    category,
    publisher,
    publishYear,
    description,
    shelfLocation,
    totalCopies,
    availableCopies,
    status,
    image,
  } = req.body;

  try {
    const updateBooks = await Book.findByIdAndUpdate(
      bookId,
      {
        title,
        isbn,
        author,
        category,
        publisher,
        publishYear,
        description,
        shelfLocation,
        totalCopies,
        availableCopies,
        status,
        image,
      },
      { new: true },
    );

    res.status(201).json({
      updateBooks,
    });
  } catch (error) {
    console.error(`Error on updating books ${error.message}`);
    res.status(500).json({
      message: "Error on Server, Please try again later.",
    });
  }
};

export const deleteBooks = async (req, res) => {
  const { bookId } = req.params;

  try {
    await Book.findByIdAndDelete(bookId);

    res.status(200).json({
      message: "Successfully Deleted a Book.",
    });
  } catch (error) {
    console.error(`Error on deleting book ${error.message}`);
    res.status(500).json({
      message: "Error on Server, Try again later.",
    });
  }
};

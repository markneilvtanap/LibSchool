import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },

    isbn: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Book category is required"],
      trim: true,
    },

    publisher: {
      type: String,
      trim: true,
    },

    publishedYear: {
      type: Number,
    },

    description: {
      type: String,
      trim: true,
    },

    shelfLocation: {
      type: String,
      trim: true,
    },

    // Cloudinary image information
    imageUrl: {
      type: String,
      default: null,
    },

    imagePublicId: {
      type: String,
      default: null,
    },

    totalCopies: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },

    availableCopies: {
      type: Number,
      required: true,
      default: 1,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// Validate copy counts
bookSchema.pre("validate", function () {
  if (this.availableCopies > this.totalCopies) {
    this.invalidate(
      "availableCopies",
      "Available copies cannot exceed total copies",
    );
  }
});

const Book = mongoose.model("Book", bookSchema);

export default Book;

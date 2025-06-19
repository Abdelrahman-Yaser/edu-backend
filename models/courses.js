import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: { // Fixed the typo from "descript" to "description"
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema); // Removed extra space in the model name
export default Course;
import Course from "../../models/courses.js";

const createCourse = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    if (!title || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and price are required.",
      });
    }

    const existingCourse = await Course.findOne({ title }).exec();
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "A course with this title already exists.",
      });
    }

    const course = new Course({ title, description, price });

    await course.save();

    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export default createCourse;

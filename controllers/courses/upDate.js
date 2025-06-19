 import Course from "../../models/courses.js";
 
 export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const courseData = req.body;

  try {
    // Assuming you have a Course model to interact with your database
    const updatedCourse = await Course.findByIdAndUpdate(id, courseData, {
      new: true,
      runValidators: true,
    });

    if (!updatedCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
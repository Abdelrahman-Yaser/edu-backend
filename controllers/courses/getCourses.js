import Course from "../../models/courses.js";

export const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 }); // Sort by creation date in descending order
        if (!courses.length) {
            return res.status(404).json({ success: false, message: "No courses found." });
        }
        res.status(200).json({ success: true, courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};



export const getCourseById = async (req, res) => {
    const { id } = req.params;
    try {
        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found." });
        }
        res.status(200).json({ success:     true, course });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}
import Artical from "../../models/articales.js";

const createArtical = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required." });
    }

    const existingPost = await Artical.findOne({ title }).exec();
    if (existingPost) {
      return res.status(400).json({ success: false, message: "A post with this title already exists." });
    }

    const artical = new Artical({ title, content });
    await artical.save();

    res.status(201).json({ success: true, artical }); // ✅ هذا هو التعديل
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export default createArtical;

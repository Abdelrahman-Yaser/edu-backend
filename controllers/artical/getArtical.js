import Artical from "../../models/articales.js";

export const getArticales = async (req, res) => {
    try {
        const articales = await Artical.find().sort({ createdAt: -1 });
        if (!articales.length) {
            return res.status(404).json({ success: false, message: "No articles found." });
        }
        res.status(200).json({ success: true, articales });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};
 export const getArtical = async (req, res) => {
    try {
        const { id } = req.params;
        const artical = await Artical.findById(id);
        if (!artical) {
            return res.status(404).json({ success: false, message: "Article not found." });
        }
        res.status(200).json({ success: true, artical });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}
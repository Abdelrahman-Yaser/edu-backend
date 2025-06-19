import Artical from "../../models/articales.js";
export const updateArtical = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const artical = await Artical.findByIdAndUpdate(id, updatedData, { new: true });
        if (!artical) {
            return res.status(404).json({ success: false, message: "Article not found." });
        }
        res.status(200).json({ success: true, artical });       
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};
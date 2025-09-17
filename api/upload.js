import nextConnect from "next-connect";
import multer from "multer";
import cloudinary from "../../utils/cloudinary.js"; // make sure this file configures Cloudinary

// Use memory storage (no temp files on Vercel)
const upload = multer({ storage: multer.memoryStorage() });

const apiRoute = nextConnect({
  onError(error, req, res) {
    console.error("Upload error:", error);
    res.status(501).json({ error: `Something went wrong: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  try {
    // Convert buffer → base64 data URI
    const fileBuffer = req.file.buffer.toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${fileBuffer}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "lykoria_uploads", // optional: your folder name
    });

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Multer handles body parsing
  },
};

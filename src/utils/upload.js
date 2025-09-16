import nextConnect from "next-connect";
import multer from "multer";
import cloudinary from "./cloudinary.js";
import fs from "fs";

const upload = multer({ dest: "/tmp" }); // temporary in Vercel’s lambda


const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Something went wrong: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  try {
    const filePath = req.file.path;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "lykoria_uploads",
    });

    // Remove temp file
    fs.unlinkSync(filePath);

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // important for multer
  },
};

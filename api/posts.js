import nextConnect from "next-connect";
import multer from "multer";
import cloudinary from "./cloudinary.js";
import fs from "fs";

const upload = multer({ dest: "/tmp" });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Something went wrong: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single("image"));

apiRoute.post(async (req, res) => {
  try {
    let imageUrl = "";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "lykoria_uploads",
      });
      fs.unlinkSync(req.file.path);
      imageUrl = result.secure_url;
    }

    // Example: save post to MongoDB (or any DB)
    const { title, body, category } = req.body;
    const newPost = {
      title,
      body,
      category,
      image: imageUrl,
      createdAt: new Date(),
    };

    // await Post.create(newPost); // your DB save logic

    res.json({ success: true, data: newPost });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    res.status(500).json({ error: "Upload or save failed" });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Required for multer
  },
};

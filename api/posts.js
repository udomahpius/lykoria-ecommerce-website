import nextConnect from "next-connect";
import multer from "multer";
import cloudinary from "../../utils/cloudinary.js";
import dbConnect from "../../utils/dbConnect.js";
import Post from "../../models/Post.js"; // Mongoose model

// Multer memory storage for Vercel
const upload = multer({ storage: multer.memoryStorage() });

const handler = nextConnect({
  onError(error, req, res) {
    console.error("Posts API error:", error);
    res.status(500).json({ success: false, error: error.message });
  },
  onNoMatch(req, res) {
    res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  },
});

// Connect DB before each request
handler.use(async (req, res, next) => {
  await dbConnect();
  next();
});

// Handle single file field called "image"
handler.use(upload.single("image"));

// ===== CREATE POST =====
handler.post(async (req, res) => {
  try {
    let imageUrl = null;

    if (req.file) {
      const fileBuffer = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${fileBuffer}`;

      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "lykoria_posts",
      });

      imageUrl = result.secure_url;
    }

    const { title, body, url, urlText, category, status } = req.body;

    const newPost = new Post({
      title,
      body,
      url,
      urlText,
      category,
      status: status || "draft",
      image: imageUrl,
    });

    await newPost.save();

    res.status(201).json({ success: true, post: newPost });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ success: false, error: "Failed to create post" });
  }
});

// ===== GET ALL POSTS =====
handler.get(async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load posts" });
  }
});

export const config = {
  api: {
    bodyParser: false, // Multer handles body
  },
};

export default handler;

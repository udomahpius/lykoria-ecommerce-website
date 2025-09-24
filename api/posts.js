import nextConnect from "next-connect";
import multer from "multer";
import cloudinary from "../../utils/cloudinary.js";
import dbConnect from "../../utils/dbConnect.js";
import Post from "../../models/Post.js";

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
      const result = await cloudinary.uploader.upload(dataURI, { folder: "lykoria_posts" });
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

// ============================
// Extra CRUD routes
// ============================
handler.get(async (req, res) => {
  if (req.query.id) {
    try {
      const post = await Post.findById(req.query.id);
      if (!post) return res.status(404).json({ error: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  }
});

handler.put(async (req, res) => {
  try {
    const { id } = req.query;
    let updateData = { ...req.body };

    if (req.file) {
      const fileBuffer = req.file.buffer.toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${fileBuffer}`;
      const result = await cloudinary.uploader.upload(dataURI, { folder: "lykoria_posts" });
      updateData.image = result.secure_url;
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPost) return res.status(404).json({ error: "Post not found" });

    res.json({ success: true, post: updatedPost });
  } catch (err) {
    res.status(500).json({ error: "Failed to update post" });
  }
});

handler.delete(async (req, res) => {
  try {
    const { id } = req.query;
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) return res.status(404).json({ error: "Post not found" });

    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;

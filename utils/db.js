import mongoose from "mongoose";

let isConnected = false;

async function dbConnect() {
  if (isConnected) return;

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not set in environment");
  }

  const db = await mongoose.connect(process.env.MONGO_URI);
  isConnected = db.connections[0].readyState;
  console.log("✅ MongoDB connected");
}

export default dbConnect;

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true } // createdAt + updatedAt automatic
);

export default mongoose.model("Post", postSchema);
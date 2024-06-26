import mongoose from "mongoose";

const replyCommentBlog = new mongoose.Schema(
  {
    author: String,
    status: String,
    role: String,
    avatar: String,
    content: String,
    byUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const CommentBlog = mongoose.Schema(
  {
    author: String,
    status: String,
    role: String,
    avatar: String,
    content: String,
    byUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    replies: [replyCommentBlog],
  },
  {
    timestamps: true,
  }
);

const BlogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    imageTitle: String,
    description: {
      type: String,
      require: true,
    },
    content: String,
    comments: [CommentBlog],
    hasNewComment: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Blog", BlogSchema);

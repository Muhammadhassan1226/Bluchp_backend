import mongoose from "mongoose";

const postsSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    text: {
      type: String,
      optional: true,
    },
    media: {
      type: String,
      optional: true,
    },
    image: {
      type: String,
      optional: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
    ],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        client: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Client",
          required: true,
        },
        username: {
          type: String,
          required: true,
        },
        profileImage: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Posts = mongoose.model("Posts", postsSchema);

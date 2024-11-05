import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      optional: true,
    },
    lastName: {
      type: String,
      optional: true,
    },

    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    folowers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        default: [],
      },
    ],
    profileImg: {
      type: String,
      default: "",
    },
    profileImgId: {
      type: String,
      default: "",
    },
    coverImgId: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
      optional: true,
    },
    googleId: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Posts",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

export const ClientModel = mongoose.model("Client", ClientSchema);

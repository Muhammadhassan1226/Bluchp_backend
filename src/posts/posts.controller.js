import { error } from "node:console";
import {
  UploadonCloudinary,
  DestroyonCloudinary,
} from "../../config/cloudinary.js";
import { Notification } from "../notifications/notification.model.js";
import { ClientModel } from "../user/User.models.js";
import { Posts } from "./posts.models.js";
import fs from "node:fs";
import { waitForDebugger } from "node:inspector";

export const createPost = async (req, res) => {
  try {
    const { text, tags } = req.body;
    const file = req.file;
    console.log("req", req.body);

    const userId = req.user;
    process.env.NODE_ENV === "development" && console.log("file", file);
    process.env.NODE_ENV === "development" && console.log("text", text);

    let user = await ClientModel.findById({ _id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Upload post to cloudinary
    let mediaUrl = "";
    if (file) {
      let filePath = file.path;

      // Check file type and upload accordingly
      if (file.mimetype.startsWith("image/")) {
        let imageUpload = await UploadonCloudinary(filePath, "Posts");
        mediaUrl = imageUpload.secure_url;
      } else if (file.mimetype.startsWith("video/")) {
        let videoUpload = await UploadonCloudinary(filePath, "Videos");
        mediaUrl = videoUpload.secure_url;
        console.log("url", videoUpload.playback_url);
      }

      // Remove the file from server after upload
      await fs.promises.unlink(filePath);
    }

    // crteate document

    const newPost = new Posts({
      client: userId,
      text,
      tags: tags ? tags : "",
      media: mediaUrl,
    });

    await newPost.save();

    return res.status(200).json({ post: newPost });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("requeste_user", req.user);

    const post = await Posts.findById(id).populate("client");
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.client._id.toString() !== req.user) {
      return res
        .status(401)
        .json({ error: "You are Unauthorized to delete this post" });
    }
    if (post.image) {
      const Imagesplit = post.image.split("/");
      const PublicId =
        Imagesplit.at(-2) + "/" + Imagesplit.at(-1)?.split(".").at(-2);
      console.log("PublicId", PublicId);
      await DestroyonCloudinary(PublicId);
    }
    await Posts.deleteOne({ _id: id });
    res.status(200).json({ message: "Post Deleted" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const likesUnlikesPost = async (req, res) => {
  try {
    const userId = req.user;
    const { id: postId } = req.params;

    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const postlts = post?._id.toString();

    if (post.client._id == userId) {
      return res.status(401).json({ error: "You cannot liked your own post" });
    }

    const userLiked = post.likes.includes(userId);

    if (userLiked) {
      await Posts.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await Posts.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      return res.status(200).json({ message: "Post Unliked " });
    } else {
      post.likes.push(userId);
      await ClientModel.updateOne(
        { _id: userId },
        { $push: { likedPosts: postId } }
      );
      await post.save();

      const notice = new Notification({
        from: userId,
        to: post.client,
        type: "like",
      });
      await notice.save();
      return res.status(200).json({ message: "Post liked ", data: postlts });
    }
  } catch (error) {
    process.env.NODE_ENV === "development" &&
      console.log("Error in Unliked/Liked", error);
    console.log("Error in Unliked/Liked");
    return res.status(500).json({ error: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Posts.find().sort({ createdAt: -1 }).populate({
      path: "client",
      select: "-password",
    });

    if (posts.length === 0) {
      return res.status(404).json({ error: "No post found" });
    }
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const commentPosts = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user;
    const { id: postId } = req.params;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const user = await ClientModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newComment = {
      text,
      username: user.username,
      profileImage: user.profileImg,
      client: userId,
    };

    post.comments.push(newComment);
    await post.save();
    return res
      .status(201)
      .json({ message: "Comment added successfully", comment: newComment });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = post.comments;
    if (comments.length === 0) {
      return res.status(404).json({ error: "No comments found" });
    }
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


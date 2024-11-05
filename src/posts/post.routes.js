import { requestValidation } from "../../middlewares/requestValidation.js";
import express from "express";
import {
  commentPosts,
  createPost,
  deletePost,
  getAllPosts,
  getComments,
  likesUnlikesPost,
} from "./posts.controller.js";
import { uploadMiddleware } from "../../middlewares/Multer.js";

const postsRouter = express.Router();

postsRouter.post(
  "/create",
  requestValidation,
  uploadMiddleware.single("file"),
  createPost
);

postsRouter.delete("/:id", requestValidation, deletePost);

postsRouter.get("/all", requestValidation, getAllPosts);

postsRouter.get("/comments/:id", getComments);

postsRouter.post("/like/:id", requestValidation, likesUnlikesPost);

postsRouter.post("/comment/:id", requestValidation, commentPosts);
export default postsRouter;

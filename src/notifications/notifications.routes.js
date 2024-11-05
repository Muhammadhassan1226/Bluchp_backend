import express from "express";
import { requestValidation } from "../../middlewares/requestValidation.js";
import {
  getNotifications,
  deleteNotifications,
  deleteNotification,
} from "./notification.controller.js";
const NoticeRouter = express.Router();

NoticeRouter.get("/", requestValidation, getNotifications);
NoticeRouter.delete("/", requestValidation, deleteNotifications);
NoticeRouter.delete("/:id", requestValidation, deleteNotification);
export default NoticeRouter;

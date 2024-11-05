import express from "express";

import {
  registerUser,
  logoutUser,
  loginUser,
  DeleteUser,
  UpdateUser,
  GetUser,

} from "./User.Controller.js";
import { requestValidation } from "../../middlewares/requestValidation.js";
import { uploadMiddleware } from "../../middlewares/Multer.js";

const clientRouter = express.Router();

clientRouter.post("/register", registerUser);

clientRouter.post("/login", loginUser);

clientRouter.post("/logout", logoutUser);

clientRouter.patch(
  "/update",
  requestValidation,
  uploadMiddleware.fields([
    {
      name: "Image",
      maxCount: 1,
    },
    { name: "Cover", maxCount: 1 },
  ]),
  UpdateUser
);

clientRouter.delete("/", DeleteUser);

clientRouter.get("/profile/:username", GetUser);


export default clientRouter;

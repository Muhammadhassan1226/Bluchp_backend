import express from "express";
const otpRouter = express.Router();
import { SendOtp, OtpVerify, resetPassword } from "./otp.controller.js";
otpRouter.post("/", SendOtp);
otpRouter.post("/verify", OtpVerify);
otpRouter.post("/reset", resetPassword);

export default otpRouter;

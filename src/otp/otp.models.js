import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

export const OTP = mongoose.model("OTP", otpSchema);

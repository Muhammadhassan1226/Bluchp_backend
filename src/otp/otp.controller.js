import createHttpError from "http-errors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { OTP } from "../otp/otp.models.js";
import sendEmail from "../hooks/sendEmail.js";
import { ClientModel } from "../user/User.models.js";
dotenv.config();
export const SendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const user = await ClientModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("Received request to send OTP to:", email);
    process.env.NODE_ENV === "development"
      ? console.log("Received request to send OTP to:", email)
      : "";
    const existingOTP = await OTP.findOne({ email });
    if (existingOTP) {
      await OTP.deleteOne({ email });
    }

    const generatedOTP = Math.floor(100000 + Math.random() * 900000);
    const duration = 1;
    const mailoptions = {
      from: process.env.Auth_mail,
      to: email,
      //   subject: "Email Verification OTP",
      subject: "Email Verification OTP",
      html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
        <div style="margin:50px auto;width:70%;padding:20px 0">
          <div style="border-bottom:1px solid #eee">
            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Email Verification</a>
          </div>
          <p style="font-size:1.1em">Hi,</p>
          <p style="font-weight:bold">Thank you for using Bluchp. Use the following OTP to complete your Sign Up procedures. OTP is valid for ${duration} hour</p>
          <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${generatedOTP}</h2>
          <p style="font-size:0.9em;">Regards,<br />Bluchp</p>
          <hr style="border:none;border-top:1px solid #eee" />
          <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
            <p>Bluchp</p>
            <p>www.bloochp.com</p>
            <p>USA</p>
          </div>
        </div>
      </div>`,
    };

    await sendEmail(mailoptions);

    const hash = await bcrypt.hash(generatedOTP.toString(), 10);
    const otprecord = await OTP.create({
      otp: hash,
      email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000 * duration,
    });
    const _otprecord = otprecord.toObject();
    delete _otprecord.otp;
    res.status(200).json({
      message: "OTP sent successfully",
      data: _otprecord,
    });
  } catch (error) {
    return next(createHttpError(400, error));
  }
};

export const OtpVerify = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    const matchotp = await OTP.findOne({ email });
    if (!matchotp) {
      return res.status(400).json({ error: "OTP record not found" });
    }
    const { expiresAt } = matchotp;
    if (expiresAt < Date.now()) {
      await OTP.deleteOne({ email });

      return res.status(400).json({ error: "OTP expired" });
    }

    const verifyotp = await bcrypt.compare(otp, matchotp.otp);
    if (!verifyotp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    matchotp.verified = true;
    await matchotp.save();
    const _matchotp = matchotp.toObject();
    delete _matchotp.otp;

    res.status(200).json({ data: _matchotp });
  } catch (error) {
    return next(createHttpError(400, error.message));
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { password, email } = req.body;
    const isValid = await OTP.findOne({ email, verified: true });
    if (!isValid) {
      return res.status(400).json({
        error: "Please First Verify Email",
      });
    }

    const user = await ClientModel.findOne({ email });
    const comparepassword = await bcrypt.compare(password, user.password);
    if (comparepassword) {
      return res.status(400).json({
        error: "Cannot set old Password as new Password",
      });
    }

    const hashedpassword = await bcrypt.hash(password, 10);
    user.password = hashedpassword;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ user: userObj });
  } catch (error) {
    return next(createHttpError(400, error.message));
  }
};

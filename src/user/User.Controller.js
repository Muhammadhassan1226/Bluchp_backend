import { ClientModel } from "./User.models.js";
import { generateToken } from "../../utils/Cookies.js";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  DestroyonCloudinary,
  UploadonCloudinary,
} from "../../config/cloudinary.js";
import fs from "fs";
export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, profileImg } = req.body;
    console.log(username, email, password, profileImg);

    const User = await ClientModel.findOne({ username });
    if (User) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const Emailuser = await ClientModel.findOne({ email });
    if (Emailuser) {
      return res.status(400).json({ error: "User with email exists" });
    }

    const salt = await bcrypt.genSalt(12);
    const HashedPassword = await bcrypt.hash(password, salt);

    const newUser = await ClientModel.create({
      username,
      email,
      password: HashedPassword,
      profileImg,
      createdAt: Date.now(),
    });

    let token;
    if (!User || !Emailuser) {
      token = jwt.sign({ sub: newUser._id }, process.env.JWTTOKEN, {
        expiresIn: "7d",
      });
    }

    const _User = newUser.toObject();
    delete _User.password;

    res.status(201).json({ token: token, user: _User });
  } catch (error) {
    return next(createHttpError(500, error.message));
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const existingUser = await ClientModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ error: "User does not exist" });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    let token;
    if (existingUser) {
      token = jwt.sign({ sub: existingUser._id }, process.env.JWTTOKEN, {
        expiresIn: "7d",
      });
    }

    const _exists = existingUser.toObject();

    delete _exists.password;
    console.log(_exists);

    res
      .status(200)
      .json({ access_token: token, user: _exists, createdAt: Date.now() });
  } catch (error) {
    return next(createHttpError(500, error.message));
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("token");
    console.log("clear-cookie");
    res.status(200).json({ message: "Logged Out" });
  } catch (error) {
    return next(createHttpError(500, error.message));
  }
};

export const DeleteUser = async (req, res, next) => {
  try {
    const { id } = req.body;
    await ClientModel.findByIdAndDelete(id);
    res.status(200).json({ message: "User Deleted" });
  } catch (error) {
    return next(createHttpError(500, error.message));
  }
};

export const UpdateUser = async (req, res) => {
  try {
    const files = req.files;
    const { firstName, lastName, bio } = req.body;
    const userId = req.user;
    console.log(userId);
    console.log("files", files);

    let user = await ClientModel.findById({ _id: userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    if (
      firstName &&
      firstName === user.firstName &&
      lastName &&
      lastName === user.lastName &&
      bio &&
      bio === user.bio &&
      !files.Image &&
      !files.Cover
    ) {
      return res.status(400).json({ error: "Please update your information" });
    }

    let Image_Url;
    let Image_Id;
    if (files.Image) {
      const ImageFilepath = files.Image[0].path;
      const Image = await UploadonCloudinary(ImageFilepath);
      await fs.promises.unlink(ImageFilepath);
      Image_Url = Image.secure_url;
      Image_Id = Image.public_id;
    }

    let Cover_Url;
    let Cover_Id;
    if (files.Cover) {
      const CoverImageFilePath = files.Cover[0].path;
      const Cover = await UploadonCloudinary(CoverImageFilePath);
      await fs.promises.unlink(CoverImageFilePath);
      Cover_Url = Cover.secure_url;
      Cover_Id = Cover.public_id;
    }

    const updatedUser = await ClientModel.findByIdAndUpdate(
      { _id: userId },
      {
        firstName: firstName ? firstName : user.firstName,
        lastName: lastName ? lastName : user.lastName,
        bio: bio ? bio : user.bio,
        profileImg: Image_Url ? Image_Url : user.profileImg,
        profileImgId: Image_Id ? Image_Id : user.profileImgId,
        coverImg: Cover_Url ? Cover_Url : user.coverImg,
        coverImgId: Cover_Id ? Cover_Id : user.coverImgId,
      },
      { new: true }
    );

    await updatedUser.save();

    if (Image_Id !== user.profileImgId) {
      await DestroyonCloudinary(user.profileImgId);
    }
    if (Cover_Id !== user.coverImgId) {
      await DestroyonCloudinary(user.coverImgId);
    }

    const _updatedUser = await ClientModel.findById({ _id: userId });
    return res.status(200).json({ UpdatedUser: _updatedUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const GetUser = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await ClientModel.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


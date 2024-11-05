import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

export const UploadonCloudinary = async (filepath, folder) => {
  try {
    if (!filepath) return null;
    const response = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
      folder: folder,
    });
    process.env.NODE_ENV ? console.log(response) : "";
    return response;
  } catch (error) {
    fs.unlinkSync(filepath);
    return null;
  }
};

export const DestroyonCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

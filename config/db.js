import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      process.env.NODE_ENV === "development"
        ? console.log("MongoDB Connected")
        : "";
    });

    mongoose.connection.on("disconnected", () => {
      process.env.NODE_ENV === "development"
        ? console.log("MongoDB Disconnected")
        : "";
    });
    mongoose.connection.on("error", (err) => {
      process.env.NODE_ENV === "development"
        ? console.log("MongoDB Connection Error", err)
        : "";
    });

    const conn = await mongoose.connect(process.env.MongoURL);
    console.log(`MongoDB Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWTTOKEN, {
    expiresIn: "10d",
  });
  console.log("Generated Token:", token);
  res.cookie("token", token, {
    maxAge: 10 * 24 * 60 * 60 * 1000,
    path: "/",
    domain: "localhost",
    sameSite: "none",
    secure: false,
    httpOnly: true,
  });
  console.log("Cookie Set: token=", token);
  return token;
};

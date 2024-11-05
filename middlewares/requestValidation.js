import jwt from "jsonwebtoken";

export const requestValidation = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    console.log("token", token);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No Token Provided" });
    }

    const parsedToken = token.split(" ")[1];

    const decodedToken = jwt.verify(parsedToken, process.env.JWTTOKEN);

    if (!decodedToken) {
      return res.status(401).json({ error: "Unauthorized: Invalid Token" });
    }

    req.user = decodedToken.sub;
    next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

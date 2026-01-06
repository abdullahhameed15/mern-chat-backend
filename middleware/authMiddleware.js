const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const protect = async (req, res, next) => {
  // get the token the user is passing
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      console.log(req.user);

      next();
    } catch (error) {
      res.status(401).json({ message: "Not Authorized , Token Failed" });
    }
  }
  if (!token) {
    res.status(401).json({ message: "Not Authorized , Token Not Found" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Not Authorized Admin Only" });
    }
  } catch (error) {
    res.status(401).json({ message: "Not Authorized" });
  }
};
module.exports = {protect , isAdmin};

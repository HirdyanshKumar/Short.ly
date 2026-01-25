const jwt = require("jsonwebtoken");
const { error } = require("../utils/response");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return error(res, "Unauthorized", 401);

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 

    next();
  } catch (err) {
    return error(res, "Invalid or expired token", 401);
  }
};

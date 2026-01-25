const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { success, error } = require("../utils/response");

const signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().optional(),
});

exports.signup = async (req, res) => {
  try {

    const { email, password, username } = req.body;

    const { error: validationError } = signupSchema.validate(req.body);
    if (validationError) return error(res, validationError.message, 400);

    const existing = await User.findOne({ email });
    if (existing) return error(res, "User already exists", 409);

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: username,
      email,
      password: hashed,
    });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return success(res, { token, user: { id: user._id, email: user.email } }, "Signup successful");
  } catch (err) {
    return error(res, err.message, 500);
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return error(res, "Email and password required", 400);

    const user = await User.findOne({ email });
    if (!user) return error(res, "Invalid credentials", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return error(res, "Invalid credentials", 401);

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return success(res, { token, user: { id: user._id, email: user.email } }, "Login successful");
  } catch (err) {
    return error(res, err.message, 500);
  }
};

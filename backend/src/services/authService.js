import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Never send the password hash to the client
const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
});

export const registerUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required", 400);
  }
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email is already registered", 409);
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  return { token: signToken(user._id), user: publicUser(user) };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // password has select:false in the schema, so we ask for it explicitly
  const user = await User.findOne({ email }).select("+password");

  // Same message for both cases so attackers cannot guess which emails exist
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid email or password", 401);
  }

  return { token: signToken(user._id), user: publicUser(user) };
};
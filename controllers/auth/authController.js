import User from "../../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userInfo: { id: userId, role } },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
};

const generateRefreshToken = (userId, role) => {
  return jwt.sign(
    { userInfo: { id: userId, role } },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const foundUser = await User.findOne({ email }).exec();
    if (foundUser) {
      return res.status(409).json({ success: false, message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 13);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id, user.role);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: "Login successful.",
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const logout = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(204).send();

    const refreshToken = cookies.jwt;
    const user = await User.findOne({ refreshToken });

    if (!user) {
      res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
      return res.status(204).send();
    }

    user.refreshToken = "";
    await user.save();

    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

const refresh = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;
    const user = await User.findOne({ refreshToken }).exec();

    if (!user) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err || user._id.toString() !== decoded.userInfo.id) {
        return res.sendStatus(403);
      }

      const accessToken = generateAccessToken(user._id, user.role);
      res.json({ accessToken });
    });
  } catch (error) {
    console.error("Refresh Error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

export default {
  register,
  login,
  logout,
  refresh
};

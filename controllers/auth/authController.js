import User from "../../models/user.js"; // User model for database operations
import bcrypt from "bcryptjs"; // Library for hashing passwords
import jwt from "jsonwebtoken"; // Library for token generation
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const generateAccessToken = (userId,role) => {
    return jwt.sign(
      { userInfo: { id: userId ,role:role} },  // Store user ID in the payload
      process.env.ACCESS_TOKEN_SECRET,  // Use the access token secret from .env
      { expiresIn: '1h' }  // Set expiration for 1 hour
    );
  };
  // Function to generate refresh token
  const generateRefreshToken = (userId,role) => {
    return jwt.sign(
      { userInfo: { id: userId,role:role } },  // Store user ID in the payload
      process.env.REFRESH_TOKEN_SECRET,  // Use the refresh token secret from .env
      { expiresIn: '7d' }  // Set expiration for 7 days
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
            user: { email: user.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// Function to handle user login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required." });
        }

        // Check if user exists
        const user = await User.findOne({ email }).exec();
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid  credentials." });
        }

        // Compare passwords
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ success: false, message: "Invalidpass credentials." });
        }

        // Generate new tokens
        const accessToken = generateAccessToken(user._id, user.role);
        const refreshToken = generateRefreshToken(user._id, user.role);

        // Update refresh token in database
        user.refreshToken = refreshToken;
        await user.save();

        // Set refresh token as HTTP-only cookie
        res.cookie("jwt", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "development" ? false : true,
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Respond with access token
        res.json({
            success: true,
            message: "Login successful.",
            accessToken,
            user: { email: user.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// Function to handle user logout
const logout = async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.jwt) {
            return res.status(204).send(); // No content
        }

        const refreshToken = cookies.jwt;

        // Find user by refresh token
        const user = await User.findOne({ refreshToken });
        if (!user) {
            res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
            return res.status(204).send();
        }

        // Remove refresh token from database
        user.refreshToken = "";
        await user.save();

        // Clear cookie
        res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
        res.status(200).json({ success: true, message: "Logged out successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};

const refresh = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401); // Unauthorized

    const refreshToken = cookies.jwt;

    // Find user by refresh token
    const user = await User.findOne({ refreshToken }).exec();
    if (!user) return res.sendStatus(403); // Forbidden

    // Verify refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err || user._id !== decoded.userInfo.id) return res.sendStatus(403); // Forbidden

        // Generate new access token
        const accessToken = generateAccessToken(user._id, user.role);
        res.json({ accessToken });
    });
};
// Export functions
export default {
    register,
    login,
    logout,
    refresh
};

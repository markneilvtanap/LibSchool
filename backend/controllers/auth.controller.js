import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const signup = async (req, res) => {
  const { firstName, lastName, email, password, conPass } = req.body;

  try {
    // check user exists
    const isExistingUser = await User.findOne({ email });

    if (isExistingUser) {
      return res.status(400).json({
        message: "User Already Exists",
      });
    }

    if (conPass !== password) {
      return res.status(400).json({
        message: "Password Doesn't Match.",
      });
    }

    // created new user
    const newUser = new User({ firstName, lastName, email, password });

    // generateTokens
    const { accessToken, refreshToken } = generateToken(newUser._id);

    // store refreshTokten in the upstash
    await storeRefreshToken(newUser._id, refreshToken);

    // set Cookies
    setCookies(res, accessToken, refreshToken);

    await newUser.save();

    res.status(200).json({
      _id: newUser._id,
      firstName: newUser.firstName,
      email: newUser.email,
      role: newUser.role,
      message: "Sign Up Successfully.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    // if (user) {
    //   const isPasscodeCorrect = await user.comparePassword(password);

    //   if (isPasscodeCorrect) {
    //     const { accessToken, refreshToken } = generateToken(user._id);
    //     await storeRefreshToken(user._id, refreshToken);
    //     setCookies(res, accessToken, refreshToken);
    //     res.status(200).json({
    //       _id: user._id,
    //       name: user.name,
    //       email: user.email,
    //       role: user.role,
    //       message: "Logged in successfully.",
    //     });
    //   }
    // } else {
    //   res.status(401).json({ message: "Invalid email or password." });
    // }

    if (user && (await user.comparePassword(password))) {
      const { accessToken, refreshToken } = generateToken(user._id);
      await storeRefreshToken(user._id, refreshToken);
      setCookies(res, accessToken, refreshToken);
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: "Logged in successfully.",
      });
    } else {
      res.status(401).json({ message: "Invalid email or password." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
      );
      await redis.del(`refresh_token${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

/**
 * * FUNCTIONS FOR GENERERATING, STORING  TOKENS
 */

const generateToken = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userID, refreshToken) => {
  await redis.set(
    `refresh_token:${userID}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60,
  );
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    samesite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    samesite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

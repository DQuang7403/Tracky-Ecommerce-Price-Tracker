import { createError } from "../middleware/createError.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// @desc Register new user
// @route POST /api/auth/signup
// @access Public
export const signup = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json("This email is already in use");
    }
    const duplicate = await User.findOne({
      name: req.body.name,
    })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();

    if (duplicate) {
      return res.status(409).json({ msg: "Duplicate username" });
    }
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({ ...req.body, hashedPassword: hashedPassword });
    await newUser.save();
    return res.status(201).json("User created successfully");
  } catch (error) {
    next(error);
    console.log(error);
  }
};

// @desc Login user
// @route POST /api/auth/login
// @access Public
export const login = async (req, res, next) => {
  try {
    let isExisted = await User.findOne({
      email: req.body.email,
    });
    if (!isExisted) {
      res.status(404).json({ msg: "This email is not registered" });
    }

    let user = await User.findOne({
      email: req.body.email,
      signWithGoogle: false,
    }).exec();

    if (!user) {
      res.status(404).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(
      req.body.password,
      user.hashedPassword,
    );
    if (!isMatch) {
      res.status(400).json({ msg: "Wrong password" });
    }

    const { hashedPassword, password, ...otherInfo } = user._doc;
    const accessToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
      },
    );
    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" },
    );
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res
      .status(200)
      .json({ access_token: accessToken, user_info: { ...otherInfo } });
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
};

// @desc Refresh token
// @route GET /api/auth/refresh
// @access Public
export const refresh = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.status(401).json("Unauthorized");
    }
    const refreshToken = cookies.jwt;
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) return res.status(403).json("Token is not valid");

        const currentUser = await User.findOne({
          _id: decoded.id,
        }).exec();
        if (!currentUser) return res.status(404).json("User not found!");
        const { hashedPassword, password, ...otherInfo } = currentUser._doc;
        const accessToken = jwt.sign(
          { id: currentUser._id },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "15m" },
        );
        res
          .status(200)
          .json({ access_token: accessToken, user_info: otherInfo });
      },
    );
  } catch (error) {
    console.log(error);
    next(createError(error));
  }
};

// @desc Logout user
// @route POST /api/auth/signout
// @access Public - clear the existing cookie
export const signout = async (req, res, next) => {
  try {
    const cookie = req.cookies;
    if (!cookie.jwt) {
      return res.status(203).json("You are not logged in");
    }
    res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
    res.status(200).json("Logged out successfully");
  } catch (error) {
    next(createError(error));
  }
};

// @desc Login user with Google
// @route POST /api/auth/google
// @access Public
export const signInWithGoogle = async (req, res, next) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    if (user && user.signWithGoogle === false) {
      return res.status(400).send("Email already exists!");
    } else if (!user) {
      const newUser = new User({ ...req.body, signWithGoogle: true });
      await newUser.save();

      const user = await User.findOne({
        email: req.body.email,
      });
      const { pwd, password, ...otherInfo } = user._doc;
    }
    const { pwd, password, ...otherInfo } = user._doc;
    const accessToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      {
        id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" },
    );
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res
      .status(200)
      .json({ access_token: accessToken, user_info: { ...otherInfo } });
  } catch (err) {
    next(err);
  }
};

const createHttpError = require("http-errors");
const User = require("../../models/User.model.js");
const bcrypt = require("bcrypt");
const smtp = require("../smtp");
const { signAccessToken, signRefreshToken } = require("../AuthTokens.js");
const salt = 5;
function generateOTP() {
  const otpLength = 6;
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString().substring(0, otpLength);
}
module.exports = {
  Signin: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        throw createError.NotFound(" email and password are required");
      const user = await User.findOne({ email: req.body.email });
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        throw createError.BadRequest("Wrong credentials");
      }
      const accessToken = await signAccessToken(user);
      const refreshToken = await signRefreshToken(user);

      res.json({
        success: true,
        message: "signin successful",
        data: {
          accessToken,
          accessExpiry: 24,
          refreshToken,
          refreshExpiry: 720,
        },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  signup: async (req, res, next) => {
    try {
      const { name, email, mobile, password } = req.body;
      if (!name || !email || !mobile || !password) {
        throw createHttpError.BadRequest("All fields are required");
      }
      const user = await User.findOne({ email: email });
      if (user) {
        throw createHttpError.Conflict("User already exists!");
      }
      const pwd = await bcrypt.hash(password, salt);
      const OTP = generateOTP();
      const newUser = {
        name: name,
        email: email,
        mobile: mobile,
        password: pwd,
        temp_otp: OTP,
      };
      const newuser = new User(newUser);
      var savedUser = await newuser.save();

      if (savedUser) {
        await smtp.mail(
          email,
          "Otp for user verification",
          `<h2>${OTP}</h2><p>This OTP is valid for 5 minutes</p>`
        );
        res.status(200).json({
          data: null,
          success: true,
          message: "enter the otp received in the next step",
        });
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  Verifyotp: async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        throw createHttpError.Conflict("Something went wrong !");
      }
      if (user.temp_otp !== otp) {
        throw createHttpError.NotFound("Otp does not match");
      }
      await User.updateOne(
        { email: email },
        { $set: { verify: true, temp_otp: null } }
      );
      res.status(200).json({
        data: null,
        success: true,
        message: "OTP verified",
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  },
  resendotp: async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email });
      if (!user) {
        throw createHttpError.Conflict("Something went wrong !");
      }
      const OTP = generateOTP();
      await smtp.mail(
        email,
        "Otp for user verification",
        `<h2>${OTP}</h2><p>This OTP is valid for 5 minutes</p>`
      );
      await User.updateOne({ email: email }, { $set: { temp_otp: OTP } });
      res.status(200).json({
        data: null,
        success: true,
        message: "OTP sent",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};

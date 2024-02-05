const bcrypt = require("bcrypt");
const createError = require("http-errors");
const Admin = require("../../Models/Admin.model")
const Otp = require("../../Models/otp.model");
const otpGenerator = require("otp-generator");
const sendmail = require("../sendmail")
const smtp = require("../smtp");
const CryptoJS = require("crypto-js");
const { signToken, verifyToken } = require("../AuthTokens")

function AddMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

module.exports = {
  sendOtp: async (req, res, next) => {
    try {
      const { email, type } = req.body;
      if (!email) throw createError.NotFound("email is required");
      const adminArray = await Admin.find({ email })
      const admin = adminArray[0];
      if (!admin)
        throw createError.UnprocessableEntity("email does not exist")
      const otp = otpGenerator.generate(6, {
        alphabets: false,
        upperCase: false,
        specialChars: false,
      });
      const now = new Date();
      const expiration_time = AddMinutesToDate(now, 10);
      var details;
      const doesExist = await Otp.findOne({ adminId: admin._id });
      if (doesExist) {
        await Otp.updateOne(
          { _id: doesExist._id },
          {
            otp: otp,
            expiry: expiration_time,
            createdAt: now,
            adminId: admin._id,
            verified: false
          }
        );
        details = {
          timestamp: now,
          email: email,
          success: true,
          message: "OTP sent to admin",
          otp_id: doesExist._id,
        };
      }
      else {
        const otpDetails = {
          otp: otp,
          expiry: expiration_time,
          createdAt: now,
          adminId: admin._id,
        };
        const otpObject = new Otp(otpDetails);
        const savedOtp = await otpObject.save();
        details = {
          timestamp: now,
          email: email,
          success: true,
          message: "OTP sent to admin",
          otp_id: savedOtp._id,
        };

      }
      const encoded = await CryptoJS.AES.encrypt(
        JSON.stringify(details),
        process.env.OTP_SECRET
      ).toString();
      const token = await signToken(details);
      smtp.mail(email, "OTP for verification", `<h2>${otp}</h2>`);
      return res.json({
        success: true,
        message: "otp sent successfully",
        data: { details: token },
      });

    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      var currentdate = new Date();
      const { verification_key, otp, email } = req.body;

      if (!verification_key) {
        throw createError.NotFound("verification key not provided")
      }
      if (!otp) {
        throw createError.NotFound("OTP not provided");

      }
      if (!email) {
        throw createError.NotFound("email not provided");

      }

      const tokenData = await verifyToken(verification_key)

      if (!tokenData.success)
        throw createError.Unauthorized("invalid verification key")
      const email_obj = tokenData.email;

      // Check if the OTP was meant for the same email or phone number for which it is being verified
      if (email_obj !== email)
        throw createError.BadRequest(
          "OTP was not sent to this particular email or phone number"
        );

      const otpDB = await Otp.findOne({ _id: tokenData.otp_id });
      //Check if OTP is available in the DB
      if (otpDB != null) {
        //Check if OTP is already used or not
        if (otpDB.verified != true) {
          //Check if OTP is expired or not
          if (otpDB.expiry.getTime() > currentdate.getTime()) {
            //Check if OTP is equal to the OTP in the DB
            if (otp === otpDB.otp) {
              // Mark OTP as verified or used
              await Otp.updateOne(
                { _id: tokenData.otp_id },
                { verified: true }
              );

              // const code = await CryptoJS.AES.encrypt(
              //   JSON.stringify({otp:otp,email:email,otpId:otpDB._id}),
              //   process.env.OTP_SECRET
              // ).toString();
              const token = await signToken({ otp: otp, email: email, otpId: otpDB._id })
              return res.json({
                success: true,
                message: "OTP matched",
                data: { token, email },
              });
            } else {
              throw createError.BadRequest("OTP not matched");
            }
          } else {
            throw createError.BadRequest("OTP expired");
          }
        } else {
          throw createError.BadRequest("OTP already used");
        }
      } else {
        throw createError.BadRequest("wrong OTP");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  changePassword: async (req, res, next) => {
    try {

      const { token, email, oldPassword, newPassword, newPassword2 } = req.body;
      const tokenData = await verifyToken(token)
      const otpDB = await Otp.findOne({ _id: tokenData.otpId });
      if (!otpDB)
        throw createError.BadRequest("invalid code / connection timed out")
      if (tokenData.email !== email)
        throw createError.BadRequest("wrong email");
      if (!otpDB.verified)
        throw createError.BadRequest("otp not verified yet");

      if (newPassword !== newPassword2)
        throw createError.Forbidden("confirm password is not matching");
      const hash = await bcrypt.hash(newPassword, 5);
      await Admin.updateOne(
        { email: email },
        {
          password: hash,
          first_signin: false,
        }
      );
      await Otp.deleteOne({ _id: tokenData.otpId })
      return res.json({ success: true, message: "password updated successfully" });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};

// if old pwd = new pwd ===> err
//  if old pwd matches the one with db then update the db
// when the otp verifies create a code with email and the otp and send it in response
// on changing password ask for that code decrypt it check id the otp is verified or not and belongs to the same mail or not
// if everything goes well allow them to change the password

// TEST CASES
// 1 - verify otp
// wrong otp - ✔
// wrong token - ✔
// mismatched email- ✔
// expired token
// 2 - change password
//  wrong token - ✔
// mismatched email- ✔
// cannot reuse the same code again to change the password - ✔
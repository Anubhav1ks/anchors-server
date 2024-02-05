const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    deactivated: { type: Boolean, default: true },
    verify: { type: Boolean, default: false },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: Number,
      default: null,
    },
    tokens: {
      type: [
        {
          accessToken: String,
          refreshToken: String,
        },
      ],
      _id: false,
      default: null,
    },
    password: {
      type: String,
    },
    temp_otp:{
      type: Number,
      minlength: 4,
      maxlength: 6,
    }
  },
  { collection: "user" },
  { strict: false }
);

const user = mongoose.model("User", userSchema);
module.exports = user;

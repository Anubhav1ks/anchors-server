const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const urlSchema = new Schema(
  {
    urlId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    origUrl: {
      type: String,
      required: true,
    },
    shortUrl: {
      type: String,
      required: true,
    },
    clicks: {
      type: Number,
      required: true,
      default: 0,
    },
    createdAt: {
      type: {
        Date,
      },
      default: Date.now(),
    },
    userid: { type: Schema.Types.ObjectId },
  },
  { collection: "url" }
);

const url = mongoose.model("url", urlSchema);
module.exports = url;

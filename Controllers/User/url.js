const Url = require("../../models/Url.modal");
const createError = require("http-errors");
function generateNanoId(length = 10) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let nanoId = "";

  for (let i = 0; i < length; i++) {
    nanoId += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return nanoId;
}
const stringIsAValidUrl = (s) => {
  try {
    new URL(s);
    return true;
  } catch (err) {
    return false;
  }
};

module.exports = {
  oepnOriginalUrl: async (req, res, next) => {
    try {
      const url = await Url.findOne({ urlId: req.params.urlId });
      if (!url) throw createError.NotFound("Something Went Wrong");
      await Url.updateOne(
        {
          urlId: req.params.urlId,
        },
        { $inc: { clicks: 1 } }
      );
      return res.redirect(url.origUrl);
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  getAllurl: async (req, res, next) => {
    try {
      const urls = await Url.find();
      console.log(urls);

      const senddata = [];
      urls.forEach((item) => {
        senddata.push({
          urlId: item.urlId,
          title: item.title,
          shortUrl: item.shortUrl,
        });
      });
      return res.status(200).json({
        data: senddata,
        success: true,
        message: "All Urls",
      }); // Assuming you want to send the URLs back in the response
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  getUserurl: async (req, res, next) => {
    try {
      const { id } = req.payload;

      if (!id) throw createError.Conflict("Something went wrong!");

      const urls = await Url.find({ userid: id });
      console.log(urls);
      return res.status(200).json({
        data: urls,
        success: true,
        message: "All Urls",
      }); // Assuming you want to send the URLs back in the response
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  Createurl: async (req, res, next) => {
    try {
      console.log(req.payload, req.body);
      const { title, url } = req.body;

      if (!title || !url)
        throw createError.NotFound("Title and URL are required");

      if (!stringIsAValidUrl(url)) throw createError.BadRequest("Invalid URL");
      const base = process.env.BASE;
      const urlId = generateNanoId(6);
      const shortUrl = `${base}/${urlId}`;
      const now = new Date();
      const newUrl = {
        urlId: urlId,
        title: title,
        origUrl: url,
        shortUrl: shortUrl,
        createdAt: now,
        userid: req.payload.id,
      };
      const newLink = new Url(newUrl);
      const savedLink = await newLink.save();

      if (savedLink) {
        return res.status(200).json({
          data: newUrl,
          success: true,
          message: "URL added successfully",
        });
      } else {
        throw createError.Conflict("Something went wrong!");
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  },
  deleteeurl: async (req, res, next) => {
    try {
      const { id } = req.body;
      console.log(id);
      const url = await Url.findOne({ _id: id });
      if (!url) throw createError.NotFound("URL does not exist");
      
      const result = await Url.deleteMany({ _id: id });
      
      if (result.deletedCount > 0) {
        return res.status(200).json({
          data: null,
          success: true,
          message: "Deleted Successfully",
        });
      } else {
        throw createError.Conflict("Something went wrong!");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
  
  editurl: async (req, res, next) => {
    try {
      console.log(req.body);
      const { id, title, changeurl } = req.body;
      console.log(id);
      const url = await Url.findOne({ _id: id });
      if (!url) throw createError.NotFound("URL does not exist");

      const result = await Url.updateOne(
        { _id: id },
        {
          $set: { title: title, origUrl: changeurl },
        }
      );
      console.log(result);
      if (result) {
        return res.status(200).json({
          data: null,
          success: true,
          message: "Updated Successfully",
        });
      } else {
        throw createError.Conflict("Something went wrong!");
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};

module.exports = {
  Createurl: async (req, res, next) => {
    try {
      console.log(req.body);
      res.status(200).json({
        data: null,
        success: true,
        message: "url added successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};

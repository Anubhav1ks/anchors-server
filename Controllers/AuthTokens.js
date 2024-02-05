const JWT = require("jsonwebtoken");

module.exports = {
  signAccessToken: (data) => {
    return new Promise((resolve, reject) => {
      console.log(data)
      const payload = { name: data.name, id: data._id ? data._id : data.id }
      const secret = process.env.ACCESS_TOKEN_SECRET;
      console.log(secret)
      const options = {
        expiresIn: "10"
      };
      JWT.sign(payload, secret, { expiresIn: '24h' }, (err, token) => {
        if (err) {
          console.log(err.message);
          reject(err.message);
          return;
        }
        resolve(token);
      });
    });
  },


  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) return next("not in headers");
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    JWT.verify(authHeader, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        return next(message);
      }
      req.payload = payload;
      next('welcome');
    });
  },

  signRefreshToken: (data) => {
    return new Promise((resolve, reject) => {
      const payload = { name: data.name, id: data._id };

      const secret = process.env.REFRESH_TOKEN_SECRET;
      const options = {
        expiresIn: "30d"
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          // reject(err)
          reject(err.message);
        }
        resolve(token);

      });
    });
  },
  signToken: (data) => {
    return new Promise((resolve, reject) => {
      const payload = data;

      const secret = process.env.OTP_SECRET;
      const options = {
        expiresIn: 600,
      };
      console.log("");
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          reject(err.message);
          return;
        }
        // console.log("this is payload of access token generated ")
        // console.log(payload)
        resolve(token);
        resolve({ token: token, expiry: options.expiresIn });
      });
    });
  },
  verifyToken: (token) => {
    console.log(token)
    return new Promise((resolve, reject) => {
      JWT.verify(token, process.env.OTP_SECRET, (err, payload) => {
        if (err) {
          const message =
            err.name === "JsonWebTokenError"
              ? "Wrong verification key"
              : err.message;
          reject({ status: 301, success: false, message });
        }
        resolve(payload);
      });
    });
    // if (!req.headers["authorization"]) return next(createError.Unauthorized());
    // const authHeader = req.headers["authorization"];
    // const bearerToken = authHeader.split(" ");
    // const token = bearerToken[1];

  },
  verifyRefreshToken: (refreshToken) => {
    return new Promise((resolve, reject) => {
      JWT.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, payload) => {
          //console.log("inside verifyRefreshToken")
          if (err) {
            const message =
              err.name === "JsonWebTokenError"
                ? "Wrong verification key"
                : err.message;
            reject({ status: 301, success: false, message });
          }

          return resolve(payload)
        });
    });
  },
};

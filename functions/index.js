const generateNanoId = (length = 10) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let nanoId = "";

  for (let i = 0; i < length; i++) {
    nanoId += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return nanoId;
};

module.exports = generateNanoId;

//handle email or usename duplicates

const handleDuplicateKeyError = (err, res) => {
  const field = Object.keys(err.keyValue);
  const code = 409;
  const error = `An account with that ${field} already exists.`;
  res.status(code).send({ messages: error, fields: field });
}
//handle field formatting, empty fields, and mismatched passwords
const handleValidationError = (err, res) => {
  let errors = Object.values(err.errors).map(el => el.message);
  let fields = Object.values(err.errors).map(el => el.path);
  let code = 400;
  if (errors.length > 1) {
    const formattedErrors = errors.join('');
    res.status(code).send({ status: code, messages: formattedErrors, fields: fields });
  } else {
    res.status(code).send({ status: code, messages: errors, fields: fields })
  }
}
const handleNotFound = (err, res) => {

  if (err.message === 'wrong password') {
    res.status(403).send({ status: 403, message: err.message })
  } else {
    res.status(404).send({ status: 404, message: err.message })
  }
}
//error controller function
module.exports = (err, req, res, next) => {

  try {
    console.log("inside error controller")

    console.log(err);
    // console.log(err.message)
    // console.log(err.name)

    if (err.name === 'ValidationError') return err = handleValidationError(err, res);
    if (err.code && err.code == 11000) return err = handleDuplicateKeyError(err, res);
    if (err.name === 'NotFoundError') return err = handleNotFound(err, res)
    if (err.name === 'ConflictError') res.status(409).send({ status: 409, message: err.message })
    if (err.name === 'BadRequestError') res.status(400).send({ status: 400, message: err.message })
    if (err.name === "UnprocessableEntityError")
      res.status(422).send({ status: 422, message: err.message });

    if (err.name === "CastError")
      res.status(422).send({ status: 422, message: err.message });

    res.status(err.status || 301).send({ status: err.status || 301, message: err.message })

  }

  catch (err) {
    res
      .status(500)
      .send({ status: 500, message: 'An unknown error occurred.' });
  }
}

// mongoose
// CastError

// create error
// 422 code for wrong details -> UnprocessableEntity
// 409 code for already used -> Conflict

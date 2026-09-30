export const errorHandler = (err, req, res, next) => {
      console.error(err);
  let statusCode = err.statusCode || 500;
  let message = err.isOperational
    ? err.message
    : "Something went wrong on the server";

  // Invalid ObjectId (e.g. /posts/abc)
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID";
  }

    // Malformed or empty JSON body (thrown by express.json)
  else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }
  // Schema validation failed (required field missing, minlength, etc.)
  else if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  }
  // Unique index violation (duplicate email)
  else if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value, already exists";
  }

  if (statusCode === 500) console.error(err);

  res.status(statusCode).json({ success: false, message });
};
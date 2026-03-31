module.exports = (err, req, res, next) => {
  console.error(err.stack); // Print the mess so I can see what broke

  // Start with 500 and hope for the best
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Fix the status codes based on what the error actually is
  if (err.message === "Catway not found" || err.message === "Reservation not found for this catway" || err.message === "user_not_found") {
    statusCode = 404;
  } else if (err.message === "wrong_credentials") {
    statusCode = 403;
  }

  res.status(statusCode).json({ message: message });
};
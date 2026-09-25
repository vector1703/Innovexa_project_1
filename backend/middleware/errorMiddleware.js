/**
 * Middleware to catch 404 Route Not Found errors.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Resource not found - ${req.method} ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Centralized global error handling middleware.
 */
const errorHandler = (err, req, res, next) => {
  // If status is 200, default to 500 for unhandled exceptions
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};

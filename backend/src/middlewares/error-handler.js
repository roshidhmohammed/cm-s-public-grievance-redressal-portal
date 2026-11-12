function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode
    || (error.name === 'MulterError' || error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 0)
    || (error.code === 11000 ? 409 : 500);
  const message = statusCode === 500
    ? 'Internal server error'
    : error.code === 11000 ? 'A record with the provided unique value already exists.' : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    success: false,
    message
  });
}

export default errorHandler;

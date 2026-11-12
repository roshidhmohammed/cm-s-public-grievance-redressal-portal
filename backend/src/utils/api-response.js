function apiResponse(res, statusCode, message, data) {
  const response = { success: statusCode < 400, message };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
}

export function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

export default apiResponse;

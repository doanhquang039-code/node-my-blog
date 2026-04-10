// API Response standardization utility

const successResponse = (res, data, message = "Success", statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const errorResponse = (
  res,
  error,
  message = "Error",
  statusCode = 400
) => {
  res.status(statusCode).json({
    success: false,
    message,
    error: error.message || error,
    timestamp: new Date().toISOString(),
  });
};

const paginatedResponse = (res, data, pagination, message = "Success") => {
  res.json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      pages: pagination.pages,
      total: pagination.total,
      limit: pagination.limit,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
};

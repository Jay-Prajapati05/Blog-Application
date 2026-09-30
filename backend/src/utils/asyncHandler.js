// Wraps async controllers so errors go to the error handler automatically
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
function throwError(msg, code) {
  throw new CustomError(msg, code);
}

class CustomError extends Error {
  constructor(message = "", name, code = 400) {
    super();
    this.message = message;
    this.statusCode = code;
    this.name = name || this.constructor.name;
    Error.captureStackTrace(this, CustomError)
  }
}

module.exports = {
  Error : (message, name, code) => new CustomError(message, name, code),
  DuplicateError : (message) => new CustomError(message, code || 402),
  AlreadyActivated : (message, name, code) => new CustomError(message, "AlreadyActivatedError", code),
  ExpiredTokenError : (message, code) => new CustomError(message, "ExpiredTokenError",code || 401),
  NotFoundError : (message, name, code) => new CustomError(message || 'not found', "NotFoundError", code),
}

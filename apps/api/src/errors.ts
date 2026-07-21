export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, "bad_request", message, details);
  }
  static unauthorized(message = "Sign in first.") {
    return new ApiError(401, "unauthorized", message);
  }
  static invalidCredentials() {
    return new ApiError(401, "invalid_credentials", "That login didn't work. Double-check your email and password.");
  }
  static forbidden(message = "You don't have permission for that.") {
    return new ApiError(403, "forbidden", message);
  }
  static notFound(message = "Not found.") {
    return new ApiError(404, "not_found", message);
  }
  static conflict(message: string) {
    return new ApiError(409, "conflict", message);
  }
  static rateLimited() {
    return new ApiError(429, "rate_limited", "Too many attempts. Give it a few minutes.");
  }
}

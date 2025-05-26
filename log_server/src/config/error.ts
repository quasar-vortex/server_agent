class CustomError extends Error {
  public statusCode: number;
  public message: string;
  constructor({
    statusCode,
    message,
  }: {
    statusCode: number;
    message: string;
  }) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
  }
}
export default CustomError;

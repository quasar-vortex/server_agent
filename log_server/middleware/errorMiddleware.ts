import { ErrorRequestHandler } from "express";

const errorMiddleware: ErrorRequestHandler = async (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Something Went Wrong" });
};

export default errorMiddleware;

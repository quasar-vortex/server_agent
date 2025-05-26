import { RequestHandler } from "express";
import { AnyZodObject, ZodError } from "zod";
import CustomError from "../config/error";

const valMiddleware: (s: AnyZodObject) => RequestHandler =
  (s) => async (req, res, next) => {
    try {
      await s.parseAsync({
        params: req.params,
        query: req.query,
        body: req.body,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new CustomError({
            statusCode: 400,
            message: error.issues.join("\n"),
          })
        );
        return;
      }
      next(error);
    }
  };

export default valMiddleware;

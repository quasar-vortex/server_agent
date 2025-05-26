import { Router } from "express";
import { apiBaseUrl } from "..";
import valMiddleware from "../middleware/valMiddleware";
import { uploadLogModel } from "../models";
import controllers from "../controllers";

/* 
POST / - Uploads new log
GET /server/:serverId - Gets last 24 hours of data for a server
*/
export const logRouter = Router();

logRouter
  .post(
    "/",
    valMiddleware(uploadLogModel),
    controllers.logsController.handleLogUpload
  )
  .get("/server/:serverId", controllers.logsController.getLogDataByServerId);

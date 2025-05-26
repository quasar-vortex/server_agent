import { Router } from "express";

import controllers from "../controllers";
import valMiddleware from "../middleware/valMiddleware";
import { registerServerModel } from "../models";

/* 
POST / - Register a new server to the system, returns serverId to store for subsequent requests
GET /- Lists all registered servers
*/

export const serverRouter = Router();

serverRouter
  .post(
    "/",
    valMiddleware(registerServerModel),
    controllers.serverController.handleServerRegistration
  )
  .get("/", controllers.serverController.getRegisteredServers);

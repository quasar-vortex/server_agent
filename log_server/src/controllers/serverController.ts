import { v4 as uuid } from "uuid";

import { RequestHandler } from "express";
import { RegisterServerModel } from "../models";
import db from "../config/db";

export const handleServerRegistration: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { ipAddress, name } = req.body as RegisterServerModel;
    db.get(
      `select id from server where ipAddress = ?`,
      [ipAddress],
      (err, row) => {
        if (err) {
          console.error("Unable to query servers:", err.message);
          res.status(500).json({ message: "Unable to query servers" });
          return;
        }
        if (row) {
          res
            .status(200)
            .json({ message: "Server already exists", serverId: row });
          return;
        }
        const serverId = uuid();
        db.run(
          `insert into server (id, ipAddress, name, dateCreated) values (?,?,?,?)`,
          [serverId, ipAddress, name, new Date()],
          (err) => {
            if (err) {
              console.error("Unable to create servers:", err.message);
              res.status(500).json({ message: "Unable to create servers" });
              return;
            }
            res.status(201).json({ message: "Server created!", serverId });
          }
        );
      }
    );
  } catch (error) {
    next(error);
  }
};
export const getRegisteredServers: RequestHandler = async (req, res, next) => {
  try {
    db.all("select id, ipAddress, name from server", [], (err, rows) => {
      if (err) {
        console.error("Unable to get servers:", err.message);
        res.status(500).json({ message: "Unable to get servers" });
        return;
      }
      res.status(200).json({ message: "Servers found!", servers: rows });
    });
  } catch (error) {
    next(error);
  }
};

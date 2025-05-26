import { RequestHandler } from "express";
import { UploadLogModel } from "../models";
import db, { ServerLogRecord } from "../config/db";
import { v4 as uuid } from "uuid";

export const handleLogUpload: RequestHandler = async (req, res, next) => {
  try {
    const { logs } = req.body as UploadLogModel;

    // Serialize ensures each action happens consecutively, not sure if other uses but needed for transactions
    db.serialize(() => {
      db.run("begin transaction");
      // Create prepared statement
      const stmt = db.prepare(`
        insert into server_log (id, serverId, commandLabel, command, response, dateCreated)
        values (?, ?, ?, ?, ?, ?)
      `);

      let hasError = false;

      for (const log of logs) {
        const { serverId, command, commandLabel, response } = log;

        stmt.run(
          [uuid(), serverId, commandLabel, command, response, new Date()],
          (err) => {
            if (err) {
              console.error("Insert failed:", err.message);
              hasError = true;
            }
          }
        );
      }
      stmt.finalize((err) => {
        // if error rollback without committing changes
        if (err || hasError) {
          db.run("rollback", () => {
            console.error("Transaction rolled back.");
            res
              .status(500)
              .json({ message: "Failed to insert one or more logs." });
          });
        } else {
          // If all entries are uploaded commit changes
          db.run("commit", (err) => {
            if (err) {
              console.error("Commit failed:", err.message);
              res.status(500).json({ message: "Commit failed." });
            } else {
              console.log("Transaction committed.");
              res.status(201).json({ message: "Logs uploaded successfully." });
            }
          });
        }
      });
    });
  } catch (error) {
    next(error);
  }
};

export const getLogDataByServerId: RequestHandler = async (req, res, next) => {
  try {
    const serverId = req.params.serverId;
    const today = new Date();
    const yesterday = new Date().setDate(today.getDate() - 1);

    db.all(
      `select id, serverId, command, commandLabel, response, dateCreated from server_log where serverId = ? and dateCreated between ? and ?;`,
      [serverId, yesterday, today],
      (err, rows) => {
        if (err) {
          console.error("Unable to find entries:", err.message);
          res.status(500).json({ message: "Unable to query logs" });
        }
        res.status(200).json({
          message: "Found log entries.",
          data: rows as ServerLogRecord[],
        });
      }
    );
  } catch (error) {
    next(error);
  }
};

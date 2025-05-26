import { exit } from "process";
import sqlite3 from "sqlite3";

const DB_PATH = "./log.db";

export type ServerRecord = {
  id: string;
  name: string;
  ipAddress: string;
  dateCreated: string;
};

export type ServerLogRecord = {
  id: string;
  serverId: string;
  commandLabel: string;
  command: string;
  response: string;
  dateCreated: string;
};

function createTables(db: sqlite3.Database) {
  db.exec(
    `
    CREATE TABLE IF NOT EXISTS server (
      id VARCHAR(36) PRIMARY KEY NOT NULL,
      name VARCHAR(20) NOT NULL,
      ipAddress VARCHAR(15) NOT NULL,
      dateCreated DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS server_log (
      id VARCHAR(36) PRIMARY KEY NOT NULL,
      serverId VARCHAR(36) NOT NULL,
      commandLabel VARCHAR(50),
      command VARCHAR(50),
      response TEXT,
      dateCreated DATETIME NOT NULL,
      FOREIGN KEY (serverId) REFERENCES server(id)
    );
    `,
    (err) => {
      if (err) {
        console.error("Error creating tables:", err.message);
        exit(1);
      } else {
        console.log("Tables Exist/Created.");
      }
    }
  );
}

const db = new sqlite3.Database(
  DB_PATH,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error("Error opening database:", err.message);
      exit(1);
    }

    createTables(db);
  }
);

export default db;

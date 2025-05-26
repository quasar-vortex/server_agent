import os from "os";

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";

const apiUrl = "http://localhost:5000/api/v1";
const agentFile = ".agent.json";

const getServerId = async () => {
  try {
    let data;
    // get the name, ip and register the server
    const payload = {
      name: os.hostname(),
      ipAddress: execSync(`curl ifconfig.me -4 2>/dev/null`).toString().trim(),
      serverId: "",
    };
    // check if the agent file exists and look for the ID
    if (existsSync(agentFile)) {
      data = JSON.parse(readFileSync(agentFile, "utf-8"));

      if (data?.serverId && data.serverId !== "") return data.serverId;
    }
    console.log("Registering Server");
    // Register the sever
    const res = await fetch(apiUrl + "/servers", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json = await res.json();
    console.log(json);
    const { serverId, message } = json;
    if (typeof message === "string" && message.includes("exists")) {
      console.log(message);
    }
    if (!serverId) {
      console.log("No ServerID");
      process.exit(1);
    }
    // Update agent file
    writeFileSync(
      agentFile,
      JSON.stringify({ ...payload, serverId: serverId.id }),
      {
        flag: "w",
      }
    );
    return serverId.id;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

type Action = {
  commandLabel: string;
  command: string;
};
type ActionResult = Action & { response: string; serverId: string };

const actions: Action[] = [
  { commandLabel: "Disk Usage", command: "du -h | sort -rh | head -10" },
  { commandLabel: "Uptime", command: "uptime" },
  { commandLabel: "Users Logged In", command: "who" },
  { commandLabel: "Memory", command: "free -m" },
  { commandLabel: "Socket Stats (Active Connections)", command: "ss -tuln" },
  { commandLabel: "DNS Check", command: "nslookup google.com" },
  { commandLabel: "Active Network Interfaces", command: "ip a" },
  { commandLabel: "Routing Table", command: "ip route show" },
  { commandLabel: "Ping Test", command: "ping -c 4 8.8.8.8" },
];

const main = async () => {
  const serverId = await getServerId();

  setInterval(async () => {
    const info: ActionResult[] = [];
    for (let action of actions) {
      info.push({
        commandLabel: action.commandLabel,
        response: execSync(action.command).toString().trim(),
        serverId,
        command: action.command,
      });
    }

    try {
      await fetch(apiUrl + "/logs", {
        method: "POST",
        body: JSON.stringify({ logs: info }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Logs sent");
    } catch (error) {
      console.error("Unable to send logs: ", error);
    }
  }, 1000 * 60 * 15);
};

main();

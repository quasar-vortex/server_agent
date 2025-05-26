import os from "os";

import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";

type Action = {
  label: string;
  command: string;
};
type ActionResult = Action & { response: string; serverId: string };

const actions: Action[] = [
  { label: "Disk Usage", command: "du -h | sort -rh | head -10" },
  { label: "Uptime", command: "uptime" },
  { label: "Users Logged In", command: "who" },
  { label: "Memory", command: "free -m" },
  { label: "Socket Stats (Active Connections)", command: "ss -tuln" },
  { label: "DNS Check", command: "nslookup google.com" },
  { label: "Active Network Interfaces", command: "ip a" },
  { label: "Routing Table", command: "ip route show" },
  { label: "Ping Test", command: "ping -c 4 8.8.8.8" },
];

const apiUrl = "http://localhost:5000/api/v1";
const agentFile = ".agent.json";

const getServerId = async () => {
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
    if (data.serverId !== "") return data.serverId;
  }
  // Register the sever
  const res = await fetch(apiUrl + "/servers", {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await res.json();
  const { serverId } = json;
  // Update agent file
  writeFileSync(agentFile, JSON.stringify({ ...payload, serverId: serverId }), {
    flag: "w",
  });
  return serverId;
};

const main = async () => {
  const serverId = await getServerId();
  setInterval(async () => {
    const info: ActionResult[] = [];
    for (let action of actions) {
      info.push({
        label: action.label,
        command: action.command,
        response: execSync(action.command).toString().trim(),
        serverId,
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

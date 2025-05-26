import { execSync } from "child_process";

type Action = {
  label: string;
  command: string;
};
type ActionResult = Action & { response: string };

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

const main = async () => {
  const info: ActionResult[] = [];
  for (let action of actions) {
    info.push({
      label: action.label,
      command: action.command,
      response: execSync(action.command).toString().trim(),
    });
  }
  console.log(info);
};

main();

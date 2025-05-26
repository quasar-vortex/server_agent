"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = __importDefault(require("os"));
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const apiUrl = "http://localhost:5000/api/v1";
const agentFile = ".agent.json";
const getServerId = () => __awaiter(void 0, void 0, void 0, function* () {
    let data;
    // get the name, ip and register the server
    const payload = {
        name: os_1.default.hostname(),
        ipAddress: (0, child_process_1.execSync)(`curl ifconfig.me -4 2>/dev/null`).toString().trim(),
        serverId: "",
    };
    // check if the agent file exists and look for the ID
    if ((0, fs_1.existsSync)(agentFile)) {
        data = JSON.parse((0, fs_1.readFileSync)(agentFile, "utf-8"));
        if (data.serverId !== "")
            return data.serverId;
    }
    // Register the sever
    const res = yield fetch(apiUrl + "/servers", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const json = yield res.json();
    const { serverId } = json;
    // Update agent file
    (0, fs_1.writeFileSync)(agentFile, JSON.stringify(Object.assign(Object.assign({}, payload), { serverId: serverId })), {
        flag: "w",
    });
    return serverId;
});
const actions = [
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
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const serverId = yield getServerId();
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        const info = [];
        for (let action of actions) {
            info.push({
                label: action.label,
                command: action.command,
                response: (0, child_process_1.execSync)(action.command).toString().trim(),
                serverId,
            });
        }
        try {
            yield fetch(apiUrl + "/logs", {
                method: "POST",
                body: JSON.stringify({ logs: info }),
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log("Logs sent");
        }
        catch (error) {
            console.error("Unable to send logs: ", error);
        }
    }), 1000 * 30);
});
main();

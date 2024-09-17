import http from "http";
import { app } from "./app";
import { initSocketServer } from "./socketServer";
import connectDB from "./utils/db";
require("dotenv").config();


// Create server
const server = http.createServer(app);

// initSocketServer
initSocketServer(server);

server.listen(process.env.NODE_PORT, () => {
    console.log(`Server is connected with port ${process.env.NODE_PORT}`);
    connectDB();
})
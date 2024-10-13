import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import { WebSocket } from "ws";
import crypto from "crypto";

import { ActiveConnections, IncomingMessage } from "./types";

const activeConnections: ActiveConnections = {};

const app = express();
const websocket = new WebSocket("ws://localhost:8000/chat");

expressWs(app);

const port = 8000;

app.use(cors());

const router = express.Router();

router.ws("/chat", (ws, req) => {
  const id = crypto.randomUUID();
  console.log("client connected! id=", id);

  activeConnections[id] = ws;
  ws.on("close", () => {
    console.log("client disconnected! id=", id);
    delete activeConnections[id];
  });

  let username = "Anonymous";

  ws.on("message", (msg) => {
    const decodedMessage = JSON.parse(msg.toString()) as IncomingMessage;

    switch (decodedMessage.type) {
      case "SET_USERNAME":
        username = decodedMessage.payload;
        break;
      case "SEND_MESSAGE":
        Object.keys(activeConnections).forEach((connId) => {
          const conn = activeConnections[connId];
          conn.send(
            JSON.stringify({
              type: "NEW_MESSAGE",
              payload: {
                username,
                text: decodedMessage.payload,
              },
            })
          );
        });

        break;
      default:
        console.log("Unknown message type:", decodedMessage.type);
    }
  });
});

app.use(router);

app.listen(port, () => {
  console.log(`Server started on ${port} port!`);
});

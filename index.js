
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

let waitingUsers = [];
let chatPairs = new Map();

io.on("connection", (socket) => {
    socket.on("findChat", (username) => {
        socket.username = username;
        if (waitingUsers.length > 0) {
            let partner = waitingUsers.pop();
            chatPairs.set(socket.id, partner.id);
            chatPairs.set(partner.id, socket.id);
            socket.emit("chatFound", partner.username);
            partner.emit("chatFound", username);
        } else {
            waitingUsers.push({ id: socket.id, username });
            socket.emit("waiting");
        }

        setTimeout(() => {
            if (!chatPairs.has(socket.id)) {
                waitingUsers = waitingUsers.filter(u => u.id !== socket.id);
                socket.emit("timeout");
            }
        }, 30000);
    });

    socket.on("sendMessage", (msg) => {
        const partnerId = chatPairs.get(socket.id);
        if (partnerId) {
            io.to(partnerId).emit("receiveMessage", { msg, from: socket.username });
        }
    });

    socket.on("disconnect", () => {
        const partnerId = chatPairs.get(socket.id);
        if (partnerId) {
            io.to(partnerId).emit("partnerLeft");
            chatPairs.delete(partnerId);
        }
        chatPairs.delete(socket.id);
        waitingUsers = waitingUsers.filter(u => u.id !== socket.id);
    });
});

server.listen(3000, () => console.log("Server started on port 3000"));

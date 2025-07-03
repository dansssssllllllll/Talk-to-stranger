
const socket = io();
let username = "";
let messageCount = 0;
let history = [];

document.getElementById("startBtn").onclick = () => {
    username = document.getElementById("username").value;
    if (document.getElementById("remember").checked) {
        localStorage.setItem("username", username);
    }
    socket.emit("findChat", username);
    document.getElementById("main").classList.add("hidden");
    document.getElementById("searching").classList.remove("hidden");
};

document.getElementById("stopBtn").onclick = () => location.reload();
document.getElementById("tryBtn").onclick = () => location.reload();
document.getElementById("closeBtn").onclick = () => location.reload();

socket.on("waiting", () => {
    document.getElementById("status").textContent = "Searching...";
});

socket.on("timeout", () => {
    document.getElementById("searching").classList.add("hidden");
    document.getElementById("timeout").classList.remove("hidden");
});

socket.on("chatFound", (mateName) => {
    document.getElementById("searching").classList.add("hidden");
    document.getElementById("chatFound").classList.remove("hidden");
    document.getElementById("foundMsg").textContent = "Chatmate found! Your chatmate is " + mateName + ". Happy chating :)";
    setTimeout(() => {
        document.getElementById("chatFound").classList.add("hidden");
        document.getElementById("chatBox").classList.remove("hidden");
    }, 5000);
});

document.getElementById("sendBtn").onclick = () => {
    const msg = document.getElementById("msgInput").value;
    if (msg.trim()) {
        addMessage(username, msg);
        socket.emit("sendMessage", msg);
        document.getElementById("msgInput").value = "";
    }
};

socket.on("receiveMessage", ({ msg, from }) => {
    addMessage(from, msg);
});

function addMessage(from, msg) {
    const div = document.createElement("div");
    div.textContent = from + ": " + msg;
    document.getElementById("messages").appendChild(div);
    history.push(from + ": " + msg);
    messageCount++;
    if (messageCount >= 5) {
        document.getElementById("exitBtn").classList.remove("hidden");
    }
}

document.getElementById("exitBtn").onclick = () => {
    if (messageCount >= 5) {
        document.getElementById("chatBox").classList.add("hidden");
        document.getElementById("historyBox").classList.remove("hidden");
        const histDiv = document.getElementById("history");
        histDiv.innerHTML = "";
        history.forEach(h => {
            const d = document.createElement("div");
            d.textContent = h;
            histDiv.appendChild(d);
        });
    }
};

socket.on("partnerLeft", () => {
    alert("Your chatmate left the chat.");
    location.reload();
});

if (localStorage.getItem("username")) {
    document.getElementById("username").value = localStorage.getItem("username");
    document.getElementById("remember").checked = true;
}

function setTheme(theme) {
    document.body.classList.remove("boy-theme", "girl-theme");
    if (theme === "boy") {
        document.body.classList.add("boy-theme");
    } else {
        document.body.classList.add("girl-theme");
    }
}

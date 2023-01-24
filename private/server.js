const express = require("express")
const { Server } = require("ws")
const app = express()

app.set("view engine", "ejs")
app.set("views", "../views")

app.get("/", logger, (req, res) => {
    res.render("index")
})

app.listen(3000, () => {
    console.log("Example server listening on port 3000")
})

function logger (req, res, next) {
    console.log("Page accessed or reloaded");
    next()
}
let num = 0
const wss = new Server({port: 443})
let connections = new Set()
let verifiedUsers = []
wss.on("connection", (ws) => {
    console.log("Client connected")
    const userID = getID()
    const user = {"userID": userID, "ws": ws}
    connections.add(user)
    displayUsers()
    ws.send(JSON.stringify({"type": "userID", "text": userID}))
    verifiedUsers[verifiedUsers.length] = userID

    ws.on("message", (event) => {
        const data = JSON.parse(event)
        if (data.type === "message") {
            console.log("[" + data.userID + "]{to " + data.recipient + "}//" + data.text)}
            if (data.recipient != "all") {
                console.log(connections)
                connections.forEach((user) => {
                    if (user.userID == data.recipient) {
                        user.ws.send(JSON.stringify({"type": "message", "userID": data.userID, "recipient": data.recipient, "text": data.text}))
                    }
                })
            }
            if (data.recipient === "all") {
                connections.forEach((user) => {
                    user.ws.send(JSON.stringify({"type": "message", "userID": data.userID, "recipient": data.recipient, "text": data.text}))
                })
            }
        if (data.type === "pong") {
            verifiedUsers[verifiedUsers.length] = data.userID
        }
    })

    ws.on("close", () => {
        verifiedUsers.splice(0, verifiedUsers.length)
        setTimeout(() => {
        connections.forEach((user) => {
            user.ws.send(JSON.stringify({"type": "ping"}))
            console.log("User " + user.userID + " pinged")
        })
        
        setTimeout(() => {
        connections.forEach((user) => {
            let found = false
            verifiedUsers.forEach((vUser) => {
                console.log("+User: " + user.userID)
                console.log("+Verifed user: " + vUser)
                if (user.userID === vUser) {
                    found = true
                    console.log("User " + user.userID + " verified")
                }
            })
            if (found === false) {
                console.log("User " + user.userID + " deleted")
                connections.delete(user)
            }
        })
    verifiedUsers.splice(0, verifiedUsers.length)
    displayUsers()
    }, 500)
    })}, 500)
})

function displayUsers() {
    console.log("--USER LIST--")
    connections.forEach((user) => {
        console.log("User " + user.userID)
    })
}

function getID() {
    let ID = Math.floor(Math.random() * 10000) + 1

    for (let i = 0; i < connections.length; i++) {
        if (connections[i].userID === ID) {
            getID()
        }
    }
    return ID
}
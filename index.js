/*

    ==================================
    |      ╔═╗╦╔╗ ╔═╗╦ ╦╔╦╗╦╔═╗      |
    |      ╚═╗║╠╩╗╚═╗║ ║ ║ ║╚═╗      |
    |      ╚═╝╩╚═╝╚═╝╚═╝ ╩ ╩╚═╝      |
    |    ╔═╗╔═╗╦ ╦╔═╗╔╦╗╦ ╦╦  ╔═╗    |
    |    ╚═╗║  ╠═╣║╣  ║║║ ║║  ║╣     |
    |    ╚═╝╚═╝╩ ╩╚═╝═╩╝╚═╝╩═╝╚═╝    |
    |            ╔═╗╔═╗╦             |
    |            ╠═╣╠═╝║             |
    |            ╩ ╩╩  ╩             |
    ==================================
    Authors:
    @ Egoshin Alexey        (https://github.com/RipeCherries)
    @ Nikolaev Vladislav    (https://github.com/Vl1ts)

*/

/* --- Importing libraries --- */
const express = require("express");
const basicAuth = require('express-basic-auth');
const bodyParser = require('body-parser');
const fs = require("fs");


/* --- Importing custom functions --- */
const getAllGroups = require("./utils/getAllGroups");
const getSchedule = require("./utils/getSchedule");


/* --- Creating an API application --- */
const app = express();

// limitation on the size of transmitted data
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000
}));


/* --- API router --- */
const router = express.Router();


/* --- Authorization --- */
const auth = basicAuth({
    users: { 'admin': 'admin' },
    challenge: true
})


/* --- API endpoint`s --- */
// common (main) URL:
router.get("/", (req, res) => {
    res.send("API for the SibSUTIS University schedule mobile application. " +
        "Go to the URL /admin to enter the admin panel.");
})

// admin URL:
router.get("/admin", auth, (req, res) => {
    res.sendFile(__dirname + "/index.html" );
})

// schedule update URL:
router.post("/scheduleUpload", auth, (req, res) => {
    if (!req.body) {
        return res.sendStatus(400);
    }


    const groupsData = getAllGroups(req.body);
    fs.writeFileSync(__dirname + "/data/allGroups.json", JSON.stringify(groupsData));

    const scheduleData = getSchedule(req.body);
    fs.writeFileSync(__dirname + "/data/schedule.json", JSON.stringify(scheduleData));


    const d = new Date();
    const tmp = {
        date: d.getTime()
    }

    fs.writeFileSync(__dirname + "/data/date.json", JSON.stringify(tmp));

    return res.sendStatus(200);
});

// get list of group name`s URL:
router.get("/allGroups", (req, res) => {
    const data = fs.readFileSync(__dirname + "/data/allGroups.json", "utf8");
    const groups = JSON.parse(data);
    res.send(groups);
});

// get schedule URL:
router.get("/schedule", (req, res) => {
    const data = fs.readFileSync(__dirname + "/data/schedule.json", "utf8");
    const schedule = JSON.parse(data);
    res.send(schedule);
});

// get last update date URL:
router.get("/lastUpdate", (req, res) => {
    const data = fs.readFileSync(__dirname + "/data/date.json", "utf8");
    const date = JSON.parse(data);
    res.send(date);
})

app.use("/", router);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));


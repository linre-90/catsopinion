const pino = require("pino");
const logger = pino({
    level: process.env.NODE_ENV === "production" ? "info" : "debug"
});

const reqLogger = pino({
    level: process.env.NODE_ENV === "production" ? "info" : "debug"
});

module.exports = {logger, reqLogger};
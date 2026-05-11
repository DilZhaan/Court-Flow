import fs from "fs";
import path from "path";
import winston from "winston";

const serviceName = "courtflow-api";
const logDirectory = path.join(process.cwd(), "logs");

fs.mkdirSync(logDirectory, { recursive: true });

const uppercaseLevel = winston.format((info) => {
  info.level = info.level.toUpperCase();
  return info;
});

const readableFormat = winston.format.printf(({ level, message, timestamp, service, stack, ...meta }) => {
  const metadata = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  const payload = stack || message;

  return `[CourtFlow] ${process.pid} - ${timestamp} ${level} [${service}] ${payload}${metadata}`;
});

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  uppercaseLevel(),
  winston.format.colorize(),
  readableFormat
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  uppercaseLevel(),
  readableFormat
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: { service: serviceName },
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: path.join(logDirectory, "error.log"),
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, "combined.log"),
      format: fileFormat,
    }),
  ],
});

export default logger;

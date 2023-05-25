import { Logger } from "@aws-lambda-powertools/logger";

const SERVICE_NAME = process.env.POWERTOOLS_SERVICE_NAME;
const LOG_LEVEL =
  (process.env.LOG_LEVEL as "info" | "warn" | "debug" | "error") || "info";

const logger = new Logger({
  logLevel: LOG_LEVEL,
  serviceName: SERVICE_NAME,
});

export { logger };

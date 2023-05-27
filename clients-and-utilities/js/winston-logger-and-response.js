/**
 * To use this logger, you will need to make sure to call initializeContext() function.
 * This is to make sure that the requestId is being set globally.
 * If not, when you are returning the response to your client using okResponse() or errResponse()
 * the requestId will be null value.
 * If you want to provide your own requestId, then you do not need to call initializeContext()
 * and amend the function as per your use case.
 * Or, you can also use `responses.js` where you can provide your own requestId when returning the response
 * We are using requestId from lambda context for debugging purpose.
 * It is recommended to use initializeContext() so that it is easy for you to search back the requestId in cloudwatch.
 */

const winston = require("winston");
require("util").inspect.defaultOptions.depth = null;

let logger = winston;
let requestId = null;

/**
 * It returns a JSON object with a status code of 200, a message, and data
 * @param message - The message you want to send back to the client.
 * @param [data] - The data you want to return to the client.
 * @returns A function that returns an object.
 */
function okResponse(message, data = {}) {
  logger.info(message, data);
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      request_id: requestId,
      status_code: 200,
      message: message,
      data: data,
    }),
  };
}

/**
 * It takes in a status code, a message, and an error object, logs the error, and returns a JSON
 * response with the status code, message, and error object
 * @param statusCode - The HTTP status code to return.
 * @param message - The message you want to log and return to the client.
 * @param errorObject - The error object that was thrown.
 * @returns A function that returns an object.
 */
function errResponse(statusCode, message, errorObject = {}) {
  // using duck typing to check for the errorObject
  const constructedError =
    errorObject && errorObject.name && errorObject.stack && errorObject.message
      ? {
          name: errorObject.name,
          message: errorObject.message,
          // stack: errorObject.stack, // You can comment this out if you want to pass and expose your error stack to your client.
        }
      : errorObject;

  logger.error(message, constructedError);

  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      request_id: requestId,
      status_code: statusCode,
      message: message,
      error: constructedError,
    }),
  };
}

/* A custom formatter that will be used to format the log messages. */
const customFormatter = winston.format.printf((object) => {
  return `[${object.level.toUpperCase()}] - ${object.message}: ${JSON.stringify(
    object
  )}`;
});

/**
 * It initializes the logger and sets the requestId
 * @param [event=null] - The event object that triggered the lambda function.
 * @param [context=null] - This is the context object that is passed to the Lambda function. It
 * contains information about the Lambda function and the execution environment.
 * { error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6}
 */
function initializeContext(event = null, context = null) {
  requestId = context?.awsRequestId || null;

  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(winston.format.splat(), customFormatter),
    transports: [new winston.transports.Console()],
    defaultMeta: {
      requestId: context?.awsRequestId || null,
      service: context?.functionName || null,
      timestamp:
        event?.requestContext?.requestTimeEpoch || new Date().getTime(),
    },
  });

  event?.requestContext
    ? logger.info("Request Context", {
        identity: event.requestContext,
        payload: {
          queryStringParameters: event?.queryStringParameters || null,
          pathParameters: event?.pathParameters || null,
          body: event?.body || null,
        },
      })
    : "";
}

/**
 * Log an error message and an object containing error details.
 * @param message - The message to log.
 * @param [errorObject] - An object containing the error message and stack trace.
 */
function error(message, errorObject = {}) {
  logger.error(message, { errors: errorObject });
}

/**
 * Log a warning message with an optional object containing additional information.
 * @param message - The message to be logged.
 * @param [warningObject] - An object that contains the parameters that you want to log.
 */
function warn(message, warningObject = {}) {
  logger.warn(message, { params: warningObject });
}

/**
 * It logs a message with an optional object.
 * @param message - The message to log.
 * @param [infoObject] - This is an object that contains the parameters that you want to log.
 */
function info(message, infoObject = {}) {
  logger.info(message, { params: infoObject });
}

/**
 * > The `verbose` function is a wrapper for the `logger.verbose` function that allows us to pass in an
 * object of parameters to be logged
 * @param message - The message to log.
 * @param [verboseObject] - This is an object that will be logged to the console.
 */
function verbose(message, verboseObject = {}) {
  logger.verbose(message, { params: verboseObject });
}

/**
 * "Log a message at the debug level, and include the given object as a parameter."
 *
 * The first parameter is the message to log. The second parameter is an object that will be included
 * in the log message as a parameter
 * @param message - The message to log.
 * @param [debugObject] - This is an object that will be logged to the console.
 */
function debug(message, debugObject = {}) {
  logger.debug(message, { params: debugObject });
}

module.exports = {
  okResponse,
  errResponse,
  error,
  warn,
  info,
  verbose,
  debug,
  initializeContext,
};

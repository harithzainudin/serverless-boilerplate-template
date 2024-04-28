import { APIGatewayProxyResult } from "aws-lambda";
import { ConvertErrorObject, CustomError } from "./interfaces";
import { logger } from "ts/lambda-powertools-logger";

/**
 * The function `okResponse` returns a standardized API response with a success status code, message,
 * and optional data.
 *
 * If you are using lambda powertools, then you can remove the requestId param.
 *
 * @param {string} requestId - The `requestId` parameter is an ID that comes from the Lambda context for debugging process.
 * @param {string} message - A string that represents the message to be included in the response.
 * @param {object | Record<string, object>} data - The `data` parameter is an optional parameter that
 * can accept either an object or a record of string keys and object values. It is used to pass
 * additional data along with the response message.
 * If you want to pass other value in data, put it inside an object.
 * To make sure in future, you can add additional key value pair.
 * @param [statusCode=200] - The `statusCode` parameter is an optional parameter that specifies the
 * HTTP status code to be returned in the response. If not provided, it defaults to 200 (OK).
 * @returns an object of type `APIGatewayProxyResult`.
 *
 * @example
 * // Example 1: Creating a success response with data
 * return okResponse(requestId, "Success", { key: "value" });
 *
 * // Example 2: Creating a success response without data
 * return okResponse(requestId, "Success");
 */
function okResponse(
  requestId: string,
  message: string,
  data: object | Record<string, object> | null = {},
  statusCode = 200
): APIGatewayProxyResult {
  //   logger.info(message, data);

  const log = { message, requestId, data };

  console.log(JSON.stringify(log, null, 2));

  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      requestId: requestId,
      statusCode: 200,
      message: message,
      data: data,
    }),
  };
}

/**
 * The `errResponse` function is a TypeScript function that generates a standardized error response for
 * an API Gateway proxy.
 *
 * If you are using lambda powertools, then you can remove the requestId param.
 *
 * @param {string} requestId - The `requestId` parameter is an ID that comes from the Lambda context for debugging process.
 * @param {number} statusCode - The `statusCode` parameter is a number that represents the HTTP status
 * code of the response.
 * @param {string} message - The `message` parameter is a string that represents the error message to
 * be returned in the response. It provides a description of the error that occurred.
 * @param {Error | object | CustomError} errorObject - The `errorObject` parameter is an optional parameter that can
 * be either an `Error` object or a generic object. It is used to provide additional information about
 * the error that occurred. If it is an `Error` object, the function extracts the `name`, `message`,
 * and `stack`
 * @returns an object of type `APIGatewayProxyResult`.
 *
 * @example
 * // Example 1: Creating an error response with a standard error object
 * return errResponse(requestId, 400, "Bad Request", new Error("Invalid input"));
 *
 * // Example 2: Creating an error response with a custom error object
 * const customError = { code: 500, description: "Internal Server Error" };
 * return errResponse(requestId, 500, "Server Error", customError);
 *
 * // Example 3: Creating an error response with the minimum required parameters
 * return errResponse(requestId, 404, "Not Found");
 */
function errResponse(
  requestId: string,
  statusCode: number,
  message: string,
  errorObject: Error | CustomError | object = {}
): APIGatewayProxyResult {
  const error = convertErrorObject(errorObject);
  // logger.error(message, error.logger);

  const log = { message, requestId, errorObject };

  console.log(JSON.stringify(log, null, 2));

  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      requestId: requestId,
      statusCode: statusCode,
      message: message,
      error: error.response,
    }),
  };

  function convertErrorObject(
    errorObject: Error | object | CustomError
  ): ConvertErrorObject {
    let loggerError: CustomError | object;
    let responseError: Omit<CustomError, "stack"> | object;
    // Using duck typing to check for the errorObject
    if (
      errorObject &&
      (errorObject as Error | CustomError).name &&
      (errorObject as Error | CustomError).stack &&
      (errorObject as Error | CustomError).message
    ) {
      loggerError = {
        name: (errorObject as Error | CustomError).name,
        message: (errorObject as Error | CustomError).message,
        stack:
          (errorObject as Error | CustomError).stack || "No stack provided",
      };

      responseError = {
        name: (errorObject as Error | CustomError).name,
        message: (errorObject as Error | CustomError).message,
      };
    } else {
      loggerError = errorObject;
      responseError = errorObject;
    }

    return { logger: loggerError, response: responseError };
  }
}

export { okResponse, errResponse };

/**
 * This response utilities is default response that you can use to return back to your client
 * when your lambda is being invoke from API Gateway
 */

require("util").inspect.defaultOptions.depth = null;

/**
 * The function returns a JSON object with a 200 status code, message, and data, and logs the message.
 * @param message - The message to be included in the response body, indicating the success of the
 * request.
 * @param [context=null] - The lambda context. This is used to get the requestId. You can also provide
 * your own requestId. By default, it will try to check either the context is coming from lambda context or not
 * @param [data] - The `data` parameter is an optional object that can be passed as an argument to the
 * `okResponse` function. It is used to include any additional data that needs to be returned along
 * with the response. This data can be used by the client to perform further actions or display
 * additional information.
 * @returns This function returns an HTTP response object with a status code of 200, headers for
 * allowing cross-origin resource sharing, and a JSON body containing a request ID, status code,
 * message, and data..
 */
function okResponse(message, context = null, data = {}) {
  const rid = context
    ? context?.awsRequestId
      ? context.awsRequestId
      : context
    : null;

  console.log({ message: message, data: data, requestId: rid });

  logger.info(message, data);
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      request_id: rid,
      status_code: 200,
      message: message,
      data: data,
    }),
  };
}

/**
 * The function generates a standardized error response with status code, message, context, and error
 * object.
 * @param statusCode - The HTTP status code to be returned in the response.
 * @param message - A string message describing the error that occurred.
 * @param [context=null] - The context parameter is an optional parameter that can be passed to the
 * function. It is typically used in AWS Lambda functions to provide information about the execution
 * environment and the current invocation. The context parameter can contain information such as the
 * AWS request ID, the function name, the function version, and more. If you do not want to pass Lambda Conxtext here
 * You can pass in your own requestId.
 * @param [errorObject] - The errorObject parameter is an optional parameter that can be passed to the
 * function. It is an object that represents the error that occurred in the code. It can contain
 * properties such as name, message, and stack trace. If this parameter is not passed, an empty object
 * will be used instead.
 * @returns an object with the following properties:
 * - `statusCode`: the HTTP status code of the response
 * - `headers`: an object containing the headers of the response
 * - `body`: a JSON stringified object containing the following properties:
 *   - `request_id`: the AWS request ID (if available)
 *   - `status_code`: the HTTP status code of the response
 *   - `
 */
function errResponse(statusCode, message, context = null, errorObject = {}) {
  const rid = context
    ? context?.awsRequestId
      ? context.awsRequestId
      : context
    : null;

  // using duck typing to check for the errorObject
  const constructedError =
    errorObject && errorObject.name && errorObject.stack && errorObject.message
      ? {
          name: errorObject.name,
          message: errorObject.message,
          // stack: errorObject.stack, // You can comment this out if you want to pass and expose your error stack to your client.
        }
      : errorObject;

  console.log({
    message: message,
    error: errorObject,
    requestId: rid,
    errorStack: errorObject?.stack,
  });

  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({
      request_id: rid,
      status_code: statusCode,
      message: message,
      error: constructedError,
    }),
  };
}

module.exports = {
  okResponse,
  errResponse,
};

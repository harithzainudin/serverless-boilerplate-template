/**
 * @module dynamoDbUtils
 * @summary This ddbDocClient is a helper for developer to communicate easily with DynamoDB.
 *
 * @description
 * It simplifies working with items in Amazon DynamoDB by abstracting away the notion of attribute values.
 * This abstraction annotates native JavaScript types supplied as input parameters,
 * as well as converts annotated response data to native JavaScript types.
 *
 * The DynamoDB Document client is generally easier to use and more convenient for most use cases,
 * while the DynamoDB client provides more fine-grained control over the DynamoDB API.
 *
 * Hence we are using DynamoDB Document Client to interact with our database.
 * @requires @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb,
 *          logger (any logger you want), ramda
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  UpdateCommand,
  BatchWriteCommand,
  ScanCommand,
  GetCommandInput,
  PutCommandInput,
  UpdateCommandInput,
  DeleteCommandInput,
  ScanCommandInput,
  PutCommandOutput,
  GetCommandOutput,
  UpdateCommandOutput,
  DeleteCommandOutput,
  ScanCommandOutput,
  QueryCommandOutput,
  QueryCommandInput,
  QueryCommand,
  ExecuteStatementCommandOutput,
  ExecuteStatementCommandInput,
  ExecuteStatementCommand,
  BatchExecuteStatementCommandOutput,
  BatchExecuteStatementCommandInput,
  BatchExecuteStatementCommand,
} from "@aws-sdk/lib-dynamodb";

import { splitEvery } from "ramda";

const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

/**
 * @summary Creates a new item, or replaces an old item with a new item.
 *
 * If an item that has the same primary key as the new item already exists in the specified table,
 * the new item completely replaces the existing item.
 *
 * It takes a PutCommandInput, sends a PutCommand to DynamoDB, logs the input and response, and returns
 * the response
 * @link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_PutItem.html
 * @param {PutCommandInput} input - PutCommandInput
 * @returns PutCommandOutput
 */
async function putItem(
  input: PutCommandInput,
  actionFor?: string,
): Promise<PutCommandOutput> {
  try {
    const res = await ddbDocClient.send(new PutCommand(input));

    const log = {
      message: "Complete putItem",
      input: input,
      command_response: res,
    };

    console.log(JSON.stringify(log, null, 2));
    return res;
  } catch (e: unknown) {
    const log = {
      message: "Fail to putItem",
      input,
      actionFor,
      error: convertErrorObject(e as Error).logger,
    };

    console.log(JSON.stringify(log, null, 2));

    throw e;
  }
}

/**
 * @summary This operation returns a set of attributes for the item with the given primary key.
 *
 * If there is no matching item, GetItem does not return any data and there will be no Item element in the response.
 *
 * It takes in a GetCommandInput object, sends a GetCommand to DynamoDB, and returns the response
 * @link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_GetItem.html
 * @param {GetCommandInput} input - GetCommandInput
 * @returns The response from the DynamoDB GetItem command.
 */
async function getItem(
  input: GetCommandInput,
  actionFor: string,
): Promise<GetCommandOutput> {
  try {
    const res = await ddbDocClient.send(new GetCommand(input));
    const log = {
      message: "Complete getItem",
      input: input,
      command_response: res,
    };
    console.log(JSON.stringify(log, null, 2));
    return res;
  } catch (e) {
    const log = {
      message: "Fail to getItem",
      input,
      actionFor,
      error: convertErrorObject(e as Error).logger,
    };

    console.log(JSON.stringify(log, null, 2));
    throw e;
  }
}

/**
 * @summary Edits an existing item's attributes, or adds a new item to the table if it does not already exist.
 *
 * You can put, delete, or add attribute values.
 * You can also perform a conditional update on an existing item
 * (insert a new attribute name-value pair if it doesn't exist,
 * or replace an existing name-value pair if it has certain expected attribute values).
 *
 * It takes an UpdateCommandInput object, sends it to DynamoDB, and returns the response
 * @link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_UpdateItem.html
 * @param {UpdateCommandInput} input - UpdateCommandInput
 * * @returns The response from the DynamoDB DocumentClient.
 */
async function updateItem(
  input: UpdateCommandInput,
  actionFor: string,
): Promise<UpdateCommandOutput> {
  try {
    const res = await ddbDocClient.send(new UpdateCommand(input));
    const log = {
      message: "Complete updateItem",
      input: input,
      command_response: res,
    };
    console.log(JSON.stringify(log, null, 2));

    return res;
  } catch (e) {
    const log = {
      message: "Fail to updateItem",
      input,
      actionFor,
      error: convertErrorObject(e as Error).logger,
    };

    console.log(JSON.stringify(log, null, 2));
    throw e;
  }
}

/**
 * @summary Puts or deletes multiple items in one table.
 * This operation should be able to write to multiple items, but we want to make the implementation simpler
 * by only accepting 1 table to write only.
 *
 * It takes a table name, an action (put or delete), and an array of items, and then it splits the
 * items into batches of 25 and sends them to DynamoDB.
 *
 * This function cannot update items. If you perform this operation on an existing item
 * that item's values will be overwritten by the operation and it will appear like it was updated.
 * To update items, we recommend you use the updateItem function.
 * @link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchWriteItem.html
 * @link usage example https://dynobase.dev/dynamodb-batch-write-update-delete/
 * @param {string} tableName - The name of the table you want to write to.
 * @param {"put" | "delete"} action - "put" | "delete"
 * @param {object[]} items - An array of objects that you want to write to the database.
 */
async function batchWriteItem(
  tableName: string,
  action: "put" | "delete",
  items: { [key: string]: unknown }[],
): Promise<void> {
  try {
    const processedItems: { [key: string]: unknown }[] = [];

    if (action === "put") {
      items.forEach((item) => {
        processedItems.push({
          PutRequest: { Item: item },
        });
      });
    } else {
      items.forEach((item) => {
        processedItems.push({
          DeleteRequest: { Key: item },
        });
      });
    }

    const processedItemBatches = splitEvery(25, processedItems);
    const batchCount = processedItemBatches.length;

    const batchRequests = processedItemBatches.map(async (batch, i) => {
      const command = new BatchWriteCommand({
        RequestItems: { [tableName]: batch },
      });

      const res = await ddbDocClient.send(command);
      const log = {
        message: "Complete batchWrite",
        batch_number: i + "out of " + batchCount,
        command_response: res,
        input: batch,
      };
      console.log(JSON.stringify(log, null, 2));
    });

    await Promise.all(batchRequests);
  } catch (e) {
    const log = {
      message: "Fail to batchWriteItem",
      action,
      items,
      error: convertErrorObject(e as Error).logger,
    };

    console.log(JSON.stringify(log, null, 2));
    throw e;
  }
}

/**
 * @summary Deletes a single item in a table by primary key.
 *
 * You can perform a conditional delete operation that deletes the item if it exists,
 * or if it has an expected attribute value.
 * The DeleteItem is an idempotent operation;
 * running it multiple times on the same item or attribute does not result in an error response.
 *
 * It takes in a DeleteCommandInput object, sends a DeleteCommand to DynamoDB, logs the response, and
 * returns the response
 * @link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_DeleteItem.html
 * @param {DeleteCommandInput} input - DeleteCommandInput
 * @returns The response from the DynamoDB DocumentClient.
 */
async function deleteItem(
  input: DeleteCommandInput,
  actionFor: string,
): Promise<DeleteCommandOutput> {
  try {
    const res = await ddbDocClient.send(new DeleteCommand(input));
    const log = {
      message: "Complete deleteItem",
      command_response: res,
      input: input,
    };
    console.log(JSON.stringify(log, null, 2));
    return res;
  } catch (e) {
    const log = {
      message: "Fail to deleteItem",
      actionFor,
      input,
      error: convertErrorObject(e as Error).logger,
    };

    console.log(JSON.stringify(log, null, 2));
    throw e;
  }
}

/**
 * @summary This operation returns one or more items and item attributes by accessing every item in a table or a secondary index.
 *
 * To have DynamoDB return fewer items, you can provide a FilterExpression operation.
 * If the total number of get items exceeds the maximum dataset size limit of 1 MB,
 * the scan stops and results are returned to the user as a LastEvaluatedKey value to continue the scan in a subsequent operation.
 * The results also include the number of items exceeding the limit.
 *
 * It takes a ScanCommandInput object, sends it to DynamoDB, and returns the response
 * @link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html
 * @param {ScanCommandInput} input - ScanCommandInput
 * @returns {ScanCommandOutput}
 */
async function scanTable(
  input: ScanCommandInput,
  actionFor: string,
): Promise<ScanCommandOutput> {
  try {
    const res = await ddbDocClient.send(new ScanCommand(input));
    const log = {
      message: "Complete getItems",
      input: input,
      command_response: res,
    };
    console.log(JSON.stringify(log, null, 2));
    return res;
  } catch (e) {
    const log = {
      message: "Fail to scanTable",
      actionFor,
      input,
      error: convertErrorObject(e as Error).logger,
    };

    console.log(JSON.stringify(log, null, 2));
    throw e;
  }
}

/**
 * @summary This operation in Amazon DynamoDB finds items based on primary key values
 *
 * You must provide the name of the partition key attribute and a single value for that attribute.
 * Query returns all items with that partition key value.
 *
 * Optionally, you can provide a sort key attribute and use a comparison operator to refine the search results.
 * A Query operation always returns a result set.
 * If no matching items are found, the result set will be empty.
 *
 * Queries that do not return results consume the minimum number of read capacity units for that type of read operation.
 *
 * It takes in a QueryCommandInput object, sends a QueryCommand to DynamoDB, and returns the response
 * @link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Query.html
 * @param {QueryCommandInput} input - QueryCommandInput
 * @returns The response from the queryItems function is the response from the DynamoDB query.
 */
async function queryItems(
  input: QueryCommandInput,
): Promise<QueryCommandOutput> {
  const res = await ddbDocClient.send(new QueryCommand(input));
  const log = {
    message: "Complete queryItems",
    command_response: res,
    input: input,
  };
  console.log(JSON.stringify(log, null, 2));
  return res;
}

/**
 * @summary This operation allows you to perform reads and singleton writes on data stored in DynamoDB, using PartiQL.
 *
 * It takes in a command input, sends the command to the DynamoDB DocumentClient, logs the response,
 * and returns the response
 * @link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchExecuteStatement.html
 * @param {ExecuteStatementCommandInput} input - The input to the executeStatement command.
 * @returns The response from the DynamoDB DocumentClient.
 */
async function executeStmt(
  input: ExecuteStatementCommandInput,
): Promise<ExecuteStatementCommandOutput> {
  const res = await ddbDocClient.send(new ExecuteStatementCommand(input));
  const log = {
    message: "Complete executeStmt",
    command_response: res,
    input: input,
  };
  console.log(JSON.stringify(log, null, 2));
  return res;
}

/**
 * @summary This operation allows you to perform batch reads or writes on data stored in DynamoDB, using PartiQL.
 *
 * Each read statement in a BatchExecuteStatement must specify an equality condition on all key attributes.
 * This enforces that each SELECT statement in a batch returns at most a single item.
 *
 * A HTTP 200 response does not mean that all statements in the BatchExecuteStatement succeeded.
 * Error details for individual statements can be found under the Error field of the BatchStatementResponse for each statement.
 *
 * It takes a BatchExecuteStatementCommandInput object, sends it to the DynamoDB DocumentClient, and
 * returns the response
 * @link https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_BatchExecuteStatement.html
 * @param {BatchExecuteStatementCommandInput} input - BatchExecuteStatementCommandInput
 * @returns The response from the batchExecuteStmt command.
 */
async function batchExecuteStmt(
  input: BatchExecuteStatementCommandInput,
): Promise<BatchExecuteStatementCommandOutput> {
  const res = await ddbDocClient.send(new BatchExecuteStatementCommand(input));
  const log = {
    message: "Complete batchExecuteStmt",
    command_response: res,
    input: input,
  };
  console.log(JSON.stringify(log, null, 2));
  return res;
}

export type CustomError = {
  name: string;
  stack: string;
  message: string;
};

export type ConvertErrorObject = {
  response: Omit<CustomError, "stack"> | object;
  logger: CustomError | object;
};

function convertErrorObject(
  errorObject: Error | object | CustomError,
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
      stack: (errorObject as Error | CustomError).stack || "No stack provided",
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

export {
  putItem,
  getItem,
  updateItem,
  deleteItem,
  scanTable,
  queryItems,
  batchWriteItem,
  executeStmt,
  batchExecuteStmt,
};

export type CustomError = {
  name: string;
  stack: string;
  message: string;
};

export type ConvertErrorObject = {
  response: Omit<CustomError, "stack"> | object;
  logger: CustomError | object;
};

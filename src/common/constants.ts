export const DEF_SERVER_PORT = 3000;
export const DEF_HOSTANME = 'localhost';

export const ErrorMessage = {
  SomethingWrong: 'something went wrong',
  InvalidUUID: 'invalid ID',
  UserNotFound: 'user with such ID not found',
  UnknownRoute: 'unknown route',
  UnknownMethod: 'unknown method',
  InvalidRequestBody: 'invalid request body',
} as const;

export const HttpMethod = {
  GET: 'GET',
  DELETE: 'DELETE',
  POST: 'POST',
  PUT: 'PUT',
} as const;

export const HttpStatusCode = {
  OK: 200,
  Created: 201,
  NoContent: 204,
  BadRequest: 400,
  NotFound: 404,
  MethodNotAllowed: 405,
  InternalServerError: 500,
  BadGateway: 502,
} as const;

export const ErrorMessage = {
  SomethingWrong: 'something went wrong',
  InvalidUUID: 'invalid ID',
  UserNotFound: 'user with this ID not found',
  UnknownRoute: 'unknown route',
  UnknownMethod: 'unknown method',
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
} as const;

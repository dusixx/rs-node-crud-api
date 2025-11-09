import type { IncomingMessage, ServerResponse } from 'node:http';
import { ErrorMessage } from '../common/constants';
import { getRequestBody, isValidUUID, JSONParse, removeDups, sendJSON } from '../common/utils';
import { users } from '../db/users';
import { ValidateError, validateUserUpdate } from './utils/validate';

export const updateUserById = async (
  req: IncomingMessage,
  resp: ServerResponse,
  id: string,
): Promise<number> => {
  if (!isValidUUID(id)) {
    return sendJSON(resp, 'BadRequest', { error: ErrorMessage.InvalidUUID });
  }
  if (!users.has(id)) {
    return sendJSON(resp, 'NotFound', { error: ErrorMessage.UserNotFound });
  }
  const body = await getRequestBody(req);
  const data = JSONParse(body);
  try {
    const validData = validateUserUpdate(data);
    if (!validData) {
      return sendJSON(resp, 'BadRequest', { error: ErrorMessage.InvalidRequestBody });
    }
    const exsisting = users.get(id)!;
    const updated = { ...exsisting, ...validData };
    updated.hobbies = removeDups(updated.hobbies.map(v => v.toLocaleLowerCase()));
    users.set(id, { ...updated });

    return sendJSON(resp, 'OK', updated);
  } catch (err) {
    if (err instanceof ValidateError) {
      return sendJSON(resp, 'BadRequest', { error: err.message });
    }
    throw err;
  }
};

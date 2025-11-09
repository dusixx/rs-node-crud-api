import type { IncomingMessage, ServerResponse } from 'node:http';
import { ErrorMessage } from '../common/constants';
import { getRequestBody, isValidUUID, JSONParse, removeDups, sendJSON } from '../common/utils';
import { users } from '../db/users';
import { ValidateError, validateUserUpdate } from './utils/validate';

export const updateUserById = async (
  req: IncomingMessage,
  resp: ServerResponse,
  id: string,
): Promise<void> => {
  if (!isValidUUID(id)) {
    sendJSON(resp, 'BadRequest', { error: ErrorMessage.InvalidUUID });
    return;
  }
  if (!users.has(id)) {
    sendJSON(resp, 'NotFound', { error: ErrorMessage.UserNotFound });
    return;
  }
  const body = await getRequestBody(req);
  const data = JSONParse(body);
  try {
    const validData = validateUserUpdate(data);
    if (!validData) {
      sendJSON(resp, 'BadRequest', { error: ErrorMessage.InvalidRequestBody });
      return;
    }
    const exsisting = users.get(id)!;
    const updated = { ...exsisting, ...validData };
    updated.hobbies = removeDups(updated.hobbies.map(v => v.toLocaleLowerCase()));
    users.set(id, { ...updated });

    sendJSON(resp, 'OK', updated);
  } catch (err) {
    if (err instanceof ValidateError) {
      sendJSON(resp, 'BadRequest', { error: err.message });
      return;
    }
    throw err;
  }
};

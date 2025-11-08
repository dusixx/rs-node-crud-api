import type { IncomingMessage, ServerResponse } from 'node:http';
import { ErrorMessage } from '../common/constants';
import { getRequestBody, isValidUUID, JSONParse, sendJSON } from '../common/utils';
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
      sendJSON(resp, 'BadRequest', { error: `empty request body` });
      return;
    }
    const exsisting = users.get(id)!;
    const { hobbies: oldHobbies, id: _, ...oldRest } = exsisting;
    const { hobbies: newHobbies = [], ...newRest } = validData;
    const updated = {
      ...oldRest,
      ...newRest,
      hobbies: [...new Set(oldHobbies.concat(newHobbies))],
    };
    users.set(id, { id, ...updated });

    sendJSON(resp, 'OK', { data: updated });
  } catch (err) {
    if (err instanceof ValidateError) {
      sendJSON(resp, 'BadRequest', { error: err.message });
      return;
    }
    throw err;
  }
};

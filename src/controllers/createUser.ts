import type { IncomingMessage, ServerResponse } from 'http';
import { getRequestBody, JSONParse, sendJSON } from '../common/utils';
import type { User } from '../db/users';
import { users } from '../db/users';
import { ValidateError, validateUserCreate } from './utils/validate';

export const createUser = async (
  req: IncomingMessage,
  resp: ServerResponse,
): Promise<User | undefined> => {
  const body = await getRequestBody(req);
  const data = JSONParse(body);
  try {
    const validData = validateUserCreate(data);
    const id = crypto.randomUUID();
    const created = { id, ...validData };
    users.set(id, created);

    sendJSON(resp, 'Created', { data: created });
  } catch (err) {
    if (err instanceof ValidateError) {
      sendJSON(resp, 'BadRequest', { error: err.message });
      return;
    }
    throw err;
  }
};

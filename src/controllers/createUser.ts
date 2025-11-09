import type { IncomingMessage, ServerResponse } from 'http';
import { getRequestBody, JSONParse, removeDups, sendJSON } from '../common/utils';
import { users } from '../db/users';
import { ValidateError, validateUserCreate } from './utils/validate';

export const createUser = async (req: IncomingMessage, resp: ServerResponse): Promise<number> => {
  const body = await getRequestBody(req);
  const data = JSONParse(body);
  try {
    const validData = validateUserCreate(data);
    const id = crypto.randomUUID();
    const created = { id, ...validData };
    created.hobbies = removeDups(created.hobbies.map(v => v.toLocaleLowerCase()));
    users.set(id, created);

    return sendJSON(resp, 'Created', created);
  } catch (err) {
    if (err instanceof ValidateError) {
      return sendJSON(resp, 'BadRequest', { error: err.message });
    }
    throw err;
  }
};

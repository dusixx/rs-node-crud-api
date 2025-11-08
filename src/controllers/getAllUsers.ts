import type { ServerResponse } from 'node:http';
import { sendJSON } from '../common/utils';
import { users } from '../db/users';

export const getAllUsers = (resp: ServerResponse): void => {
  sendJSON(resp, 'OK', { data: [...users.values()] });
};

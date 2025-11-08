import type { ServerResponse } from 'node:http';
import { users } from '../db/users';
import { sendJSON } from './../common/utils';

export const getAllUsers = (resp: ServerResponse): void => {
  sendJSON(resp, 'OK', { data: [...users.values()] });
};

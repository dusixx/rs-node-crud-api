import type { ServerResponse } from 'node:http';
import { ErrorMessage } from '../common/constants';
import { isValidUUID, sendJSON } from '../common/utils';
import { users } from '../db/users';

export const getUserById = (resp: ServerResponse, id: string): void => {
  if (!isValidUUID(id)) {
    sendJSON(resp, 'BadRequest', { error: ErrorMessage.InvalidUUID });
    return;
  }
  if (!users.has(id)) {
    sendJSON(resp, 'NotFound', { error: ErrorMessage.UserNotFound });
    return;
  }
  sendJSON(resp, 'OK', users.get(id));
};

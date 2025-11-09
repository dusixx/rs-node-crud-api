import type { ServerResponse } from 'node:http';
import { ErrorMessage } from '../common/constants';
import { isValidUUID, sendJSON } from '../common/utils';
import { users } from '../db/users';

export const deleteUserById = (resp: ServerResponse, id: string): number => {
  if (!isValidUUID(id)) {
    return sendJSON(resp, 'BadRequest', { error: ErrorMessage.InvalidUUID });
  }
  if (!users.has(id)) {
    return sendJSON(resp, 'NotFound', { error: ErrorMessage.UserNotFound });
  }
  users.delete(id);
  return sendJSON(resp, 'NoContent');
};

import type { IncomingMessage, ServerResponse } from 'node:http';
import { styleText as style } from 'node:util';
import { ErrorMessage, HttpMethod } from '../common/constants';
import { getErrorMessage, sendJSON } from '../common/utils';
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
} from '../controllers';

const _usersRouter = async (req: IncomingMessage, resp: ServerResponse): Promise<void> => {
  const { method, url = '' } = req;
  const [base = '', path = '', id = '', extra = ''] = url.slice(1).split('/');

  if (extra || !/^api$/i.test(base) || !/^users$/i.test(path)) {
    sendJSON(resp, 'NotFound', { error: ErrorMessage.UnknownRoute });
    return;
  }
  switch (method) {
    case HttpMethod.GET:
      if (!id) {
        getAllUsers(resp);
      } else {
        getUserById(resp, id);
      }
      return;

    case HttpMethod.DELETE:
      deleteUserById(resp, id);
      return;

    case HttpMethod.POST:
      if (id) {
        sendJSON(resp, 'NotFound', { error: ErrorMessage.UnknownRoute });
        return;
      }
      await createUser(req, resp);
      return;

    case HttpMethod.PUT:
      await updateUserById(req, resp, id);
      return;

    default:
      sendJSON(resp, 'MethodNotAllowed', { error: ErrorMessage.UnknownMethod });
  }
};

export const usersRouter: typeof _usersRouter = async (req, resp) => {
  try {
    await _usersRouter(req, resp);
  } catch (err) {
    console.log('error:', style('red', getErrorMessage(err)));
    sendJSON(resp, 'InternalServerError', { error: ErrorMessage.SomethingWrong });
  }
};

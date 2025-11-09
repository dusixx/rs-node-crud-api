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

const _usersRouter = async (req: IncomingMessage, resp: ServerResponse): Promise<number> => {
  const { method, url = '' } = req;
  const [base = '', path = '', id = '', extra = ''] = url.slice(1).split('/');

  if (extra || !/^api$/i.test(base) || !/^users$/i.test(path)) {
    return sendJSON(resp, 'NotFound', { error: ErrorMessage.UnknownRoute });
  }
  switch (method) {
    case HttpMethod.GET:
      return id ? getUserById(resp, id) : getAllUsers(resp);

    case HttpMethod.DELETE:
      return deleteUserById(resp, id);

    case HttpMethod.POST:
      return id
        ? sendJSON(resp, 'NotFound', { error: ErrorMessage.UnknownRoute })
        : await createUser(req, resp);

    case HttpMethod.PUT:
      return await updateUserById(req, resp, id);

    default:
      return sendJSON(resp, 'MethodNotAllowed', { error: ErrorMessage.UnknownMethod });
  }
};

export const usersRouter: typeof _usersRouter = async (req, resp) => {
  try {
    const result = await _usersRouter(req, resp);
    console.log(result, req.method?.toUpperCase(), req.url);
    return result;
  } catch (err) {
    console.log('error:', style('red', getErrorMessage(err)));
    return sendJSON(resp, 'InternalServerError', { error: ErrorMessage.SomethingWrong });
  }
};

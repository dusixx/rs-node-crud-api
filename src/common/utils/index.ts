import type { RequestOptions } from 'node:http';
import { request, type IncomingMessage, type ServerResponse } from 'node:http';
import { DEF_HOSTANME, ErrorMessage, HttpStatusCode } from '../constants';
import { red } from './style';

export const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type NodeJSError = Error & {
  errno?: number;
  code?: string;
  syscall?: string;
  path?: string;
  address?: string;
  port?: number;
};

export const getRequestBody = async (
  req: IncomingMessage,
  encoding: BufferEncoding = 'utf-8',
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const result: Buffer[] = [];
    req
      .on('data', (chunk: Buffer) => {
        result.push(chunk);
      })
      .on('end', () => {
        resolve(Buffer.concat(result).toString(encoding));
      })
      .on('error', reject);
  });
};

export const sendJSON = (
  resp: ServerResponse,
  statusCode: keyof typeof HttpStatusCode,
  body?: unknown,
): number => {
  const code = HttpStatusCode[statusCode];
  resp.writeHead(code, { 'content-type': 'application/json' });
  resp.end(JSON.stringify(body));

  return code;
};

export const redirectRequestToService = async (
  req: IncomingMessage,
  resp: ServerResponse,
  port: number | string,
  hostname: string = DEF_HOSTANME,
): Promise<void> => {
  await new Promise((resolve, reject) => {
    const requestOptions: RequestOptions = {
      hostname,
      port,
      path: req.url,
      method: req.method,
      headers: req.headers,
    };
    const serviceRequest = request(requestOptions, serviceResponse => {
      serviceResponse.on('end', resolve);
      serviceResponse.on('error', reject);
      resp.writeHead(
        serviceResponse.statusCode ?? HttpStatusCode.InternalServerError,
        serviceResponse.headers,
      );
      serviceResponse.pipe(resp);
    });
    serviceRequest.on('error', reject);
    req.pipe(serviceRequest);
  });
};

export const JSONParse = (s: string): unknown => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

export const isValidUUID = (id: string): boolean => {
  return RE_UUID.test(id);
};

export const isObject = (obj: unknown): obj is Record<string, unknown> => {
  return obj != null && typeof obj === 'object';
};

export const isStr = (obj: unknown): obj is string => {
  return typeof obj === 'string';
};

export const hasOwnKeys = <T extends object>(obj: unknown, ...keys: (keyof T)[]): obj is T => {
  return isObject(obj) && keys.every(key => Object.hasOwn(obj, key));
};

export const getErrorMessage = (
  err: unknown,
  defaultMessage = ErrorMessage.SomethingWrong,
): string => {
  return err instanceof Error ? err.message : isStr(err) ? err : defaultMessage;
};

export const removeDups = <T>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

export const isNodeJSError = (err: unknown): err is NodeJSError => {
  return err instanceof Error;
};

export const showError = (err: unknown): void => {
  console.log(red('Error: '), getErrorMessage(err));
};

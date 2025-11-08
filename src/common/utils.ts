import type { IncomingMessage, ServerResponse } from 'node:http';
import { ErrorMessage, HttpStatusCode } from './constants';

const RE_VALID_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  body: unknown,
): void => {
  resp.writeHead(HttpStatusCode[statusCode], { 'content-type': 'application/json' });
  resp.end(JSON.stringify(body));
};

export const JSONParse = (s: string): unknown => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

export const isValidUUID = (id: string): boolean => {
  return RE_VALID_UUID.test(id);
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

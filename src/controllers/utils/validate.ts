import { ErrorMessage } from '../../common/constants';
import { hasOwnKeys, isObject, isStr } from '../../common/utils';
import type { UserCreate, UserUpdate } from '../../db/users';

const MIN_AGE = 16;
const MAX_AGE = 75;
const RE_VALID_NAME = /^[a-z][a-z0-9]+$/i;

type Validator = {
  validate: (v: unknown) => boolean;
  error: string;
};

export class ValidateError extends Error {}

export const ValidUserProp: Record<keyof UserCreate, Validator> = {
  username: {
    validate: v => isStr(v) && RE_VALID_NAME.test(v),
    error: `username: string: allowed [a-z0-9], first letter, at least 2 characters long`,
  },
  age: {
    validate: v => typeof v === 'number' && v <= MAX_AGE && v >= MIN_AGE,
    error: `age: number: in range from ${MIN_AGE} to ${MAX_AGE}`,
  },
  hobbies: {
    validate: v => Array.isArray(v) && v.every(s => isStr(s) && RE_VALID_NAME.test(s)),
    error: 'hobbies: string[]: allowed [a-z0-9], first letter, at least 2 characters long',
  },
};

export function validateUserCreate(data: unknown): UserCreate {
  if (!isObject(data)) {
    throw new ValidateError(ErrorMessage.InvalidRequestBody);
  }
  const validEntries = Object.entries(ValidUserProp).map(([key, { validate, error }]) => {
    if (!hasOwnKeys(data, key)) {
      throw new ValidateError(`${key}: is required`);
    }
    if (!validate(data[key])) {
      throw new ValidateError(error);
    }
    return [key, data[key]];
  });
  return Object.fromEntries(validEntries) as UserCreate;
}

export const validateUserUpdate = (data: unknown): UserUpdate | null => {
  if (!isObject(data)) {
    return null;
  }
  const validEntries = Object.entries(ValidUserProp).reduce<[string, unknown][]>(
    (res, [key, { validate, error }]) => {
      if (!hasOwnKeys(data, key)) {
        return res;
      }
      if (!validate(data[key])) {
        throw new ValidateError(error);
      }
      res.push([key, data[key]]);
      return res;
    },
    [],
  );
  return Object.fromEntries(validEntries);
};

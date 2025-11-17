import type { User, UserCreate, UserUpdate } from '../db/users';
import { users } from '../db/users';

export const getPath = (id: string = ''): string => `/api/users${id ? `/${id}` : ''}`;

export const mockUserCreate: UserCreate = {
  username: 'Rick',
  age: 50,
  hobbies: ['golf', 'fishing'],
};

export const mockUserUpdate: UserUpdate = {
  age: 75,
  hobbies: ['walking', 'reading'],
};

export const createUser = (data: UserCreate = mockUserCreate): User => {
  const id = crypto.randomUUID();
  const user = { id, ...data };
  users.set(id, user);
  return user;
};

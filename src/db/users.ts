export type User = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
};
export type UserCreate = Omit<User, 'id'>;
export type UserUpdate = Partial<UserCreate>;

export const users = new Map<string, User>();

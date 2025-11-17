/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-misused-promises */
import type { Server } from 'node:http';
import request from 'supertest';
import { ErrorMessage, HttpStatusCode } from '../common/constants';
import { ValidUserProp } from '../controllers/utils/validate';
import type { User, UserCreate } from '../db/users';
import { users } from '../db/users';
import { usersRouter } from '../router/usersRouter';
import { startHttpServer } from '../server/server.utils';
import { createUser, getPath, mockUserCreate, mockUserUpdate } from './test-utils';

let server: Server;

beforeAll(async () => {
  server = await startHttpServer({ port: 0, hostname: '' }, usersRouter);
});
afterAll(() => {
  server.close();
});
afterEach(() => {
  jest.restoreAllMocks();
});
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('CRUD API tests', () => {
  describe('GET /users', () => {
    it('should return empty array', async () => {
      const resp = await request(server).get(getPath());
      expect(resp.statusCode).toBe(HttpStatusCode.OK);
      expect(resp.body).toBeInstanceOf(Array);
      expect(resp.body).toHaveLength(0);
    });

    it('should return 404 for non-existing endpoints', async () => {
      const resp = await request(server).get('/invalid');
      expect(resp.statusCode).toBe(HttpStatusCode.NotFound);
      expect(resp.body).toEqual({ error: ErrorMessage.UnknownRoute });
    });
  });

  describe('GET /users/{id}', () => {
    it('should return existing user', async () => {
      const user = createUser();
      const resp = await request(server).get(getPath(user.id));
      expect(resp.statusCode).toBe(HttpStatusCode.OK);
      expect(resp.body).toHaveProperty('id', user.id);
      expect(resp.body).toEqual(user);
    });

    it('should return 400 if invalid id specified', async () => {
      const resp = await request(server).get(getPath('id'));
      expect(resp.statusCode).toBe(HttpStatusCode.BadRequest);
      expect(resp.body).toEqual({ error: ErrorMessage.InvalidUUID });
    });

    it('should return 404 if user not found', async () => {
      const resp = await request(server).get(getPath(crypto.randomUUID()));
      expect(resp.statusCode).toBe(HttpStatusCode.NotFound);
      expect(resp.body).toEqual({ error: ErrorMessage.UserNotFound });
    });

    it('should return 500 if failed', async () => {
      jest.spyOn(users, 'has').mockImplementation(() => {
        throw Error('critical error');
      });
      const resp = await request(server).get(getPath(crypto.randomUUID()));
      expect(resp.statusCode).toBe(HttpStatusCode.InternalServerError);
      expect(resp.body).toEqual({ error: ErrorMessage.SomethingWrong });
    });
  });

  describe('POST /users', () => {
    it('should create user', async () => {
      const resp = await request(server).post(getPath()).send(mockUserCreate);
      expect(resp.statusCode).toBe(HttpStatusCode.Created);
      expect(resp.body).toHaveProperty('id');
      expect(resp.body).toMatchObject(mockUserCreate);
      expect(users.size).toBeGreaterThan(0);
    });

    it('should remove duplicate hobbies', async () => {
      const userData: UserCreate = {
        username: 'ab',
        age: 33,
        hobbies: ['AAA', 'aaa', 'bbb', 'BbB'],
      };
      const resp = await request(server).post(getPath()).send(userData);
      expect(resp.statusCode).toBe(HttpStatusCode.Created);
      expect((resp.body as User).hobbies).toEqual(['aaa', 'bbb']);
    });

    it('should return 404 for invalid url', async () => {
      const resp = await request(server).post(getPath(crypto.randomUUID()));
      expect(resp.body).toEqual({ error: ErrorMessage.UnknownRoute });
    });

    it('should return 400 for invalid request body', async () => {
      const resp = await request(server).post(getPath()).send();
      expect(resp.statusCode).toBe(HttpStatusCode.BadRequest);
      expect(resp.body).toEqual({ error: ErrorMessage.InvalidRequestBody });
    });

    it('should return 400 for invalid user data', async () => {
      const resp = await request(server).post(getPath()).send({ username: 'rick', age: 200 });
      expect(resp.body).toEqual({ error: ValidUserProp.age.error });
    });

    it('should return 400 for required user data', async () => {
      const resp = await request(server).post(getPath()).send({ username: 'rick', age: 20 });
      expect(resp.statusCode).toBe(HttpStatusCode.BadRequest);
      expect(resp.body).toEqual({ error: 'hobbies: is required' });
    });

    it('should return 500 for unexpected error', async () => {
      jest.spyOn(crypto, 'randomUUID').mockImplementationOnce(() => {
        throw Error();
      });
      const resp = await request(server).post(getPath()).send(mockUserCreate);
      expect(resp.statusCode).toBe(HttpStatusCode.InternalServerError);
    });
  });

  describe('PUT /users/{id}', () => {
    it('should return updated user', async () => {
      const user = createUser();
      const resp = await request(server).put(getPath(user.id)).send(mockUserUpdate);
      expect(resp.statusCode).toBe(HttpStatusCode.OK);
      expect(resp.body).toHaveProperty('id', user.id);
      expect(resp.body).toEqual({ ...user, ...mockUserUpdate });
    });

    it('should return 400 if invalid id specified', async () => {
      const resp = await request(server).put(getPath('id'));
      expect(resp.statusCode).toBe(HttpStatusCode.BadRequest);
      expect(resp.body).toEqual({ error: ErrorMessage.InvalidUUID });
    });

    it('should return 404 if user not found', async () => {
      const resp = await request(server).put(getPath(crypto.randomUUID()));
      expect(resp.statusCode).toBe(HttpStatusCode.NotFound);
      expect(resp.body).toEqual({ error: ErrorMessage.UserNotFound });
    });

    it('should return 400 for invalid request body', async () => {
      const user = createUser();
      const resp = await request(server).put(getPath(user.id)).send();
      expect(resp.statusCode).toBe(HttpStatusCode.BadRequest);
      expect(resp.body).toEqual({ error: ErrorMessage.InvalidRequestBody });
    });

    it('should return 400 for invalid user data', async () => {
      const user = createUser();
      const resp = await request(server).put(getPath(user.id)).send({ username: '111' });
      expect(resp.body).toEqual({ error: ValidUserProp.username.error });
    });

    it('should return 500 for unexpected error', async () => {
      jest.spyOn(users, 'get').mockImplementation(() => {
        throw Error();
      });
      const user = createUser();
      const resp = await request(server).put(getPath(user.id)).send(mockUserUpdate);
      expect(resp.statusCode).toBe(HttpStatusCode.InternalServerError);
    });
  });

  describe('DELETE /users/{id}', () => {
    it('should delete existing user', async () => {
      const user = createUser();
      const resp = await request(server).delete(getPath(user.id));
      expect(resp.statusCode).toBe(HttpStatusCode.NoContent);
      expect(users.has(user.id)).toBeFalsy();
    });

    it('should return 400 if invalid id specified', async () => {
      const resp = await request(server).delete(getPath('id'));
      expect(resp.statusCode).toBe(HttpStatusCode.BadRequest);
      expect(resp.body).toEqual({ error: ErrorMessage.InvalidUUID });
    });

    it('should return 404 if user not found', async () => {
      const resp = await request(server).delete(getPath(crypto.randomUUID()));
      expect(resp.statusCode).toBe(HttpStatusCode.NotFound);
      expect(resp.body).toEqual({ error: ErrorMessage.UserNotFound });
    });
  });

  describe('other tests', () => {
    it('should return 405 error for unsupported request method', async () => {
      const resp = await request(server).patch(getPath());
      expect(resp.statusCode).toBe(HttpStatusCode.MethodNotAllowed);
      expect(resp.body).toEqual({ error: ErrorMessage.UnknownMethod });
    });
  });
});

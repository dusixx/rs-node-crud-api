# Simple CRUD API

A simple CRUD API application written in `TypeScript`, that works with an `in-memory database`. It implements horizontal scaling using `Node.js ClusterAPI`. It runs multiple application instances, with a `load balancer` distributing requests between them (using the `Round Robin` algorithm).

## 🚀 Install

```sh
git clone git@github.com:dusixx/rs-node-crud-api.git
cd rs-node-crud-api
git checkout dev
npm i
```

#### Create `.env`

in the `root` of the project with the following contents

```sh
BASE_PORT=4000
LOAD_BALANCER_PORT=4001
```

#### Run in `dev mode`

```sh
npm run start:dev
# or shorter
npm start
```

#### Run in `production mode`

```sh
npm run start:prod
```

#### Run `multiple instances`

```sh
npm run start:multi
# or shorter
npm run multi
```

#### 🧪 Run tests

```sh
npm run test
npm run coverage
```

## ✅️ To check functionality

in clients like `Postman`, enter in the address bar

- `http://localhost:4000/api/users/{id}`: single-threaded mode (port **4000**)
- `http://localhost:4001/api/users/{id}`: multi-threaded mode (port **4001**)

#### User types (body)

```ts
type User = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
};
type UserCreate = Omit<User, 'id'>;
type UserUpdate = Partial<UserCreate>;
```

#### Endpoints

- `GET /api/users` — get array of all persons
- `GET /api/users/{id}` — get single person
- `POST /api/users` — create new person (`UserCreate` body required)
- `PUT /api/users/{id}` — update person data (`UserUpdate` body required)
- `DELETE /api/users/{id}` — delete person

## 🆘 In case something goes wrong

to `kill` the node, enter in the `OS terminal`

```sh
# for win32 platforms
taskkill /f /im node.exe
# for *nix platforms
killall -9 node
```

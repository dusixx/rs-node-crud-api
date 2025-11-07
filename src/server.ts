import dotenv from 'dotenv';
import http from 'node:http';

dotenv.config();

const DEF_PORT = 3000;
const HOSTNAME = 'localhost';
const PORT = Number(process.env.BASE_PORT) || DEF_PORT;

const server = http.createServer((req, resp) => {
  console.log(req.method, req.url);
  resp.end(`${req.method}${req.url}`);
});

server.listen(PORT, HOSTNAME, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});

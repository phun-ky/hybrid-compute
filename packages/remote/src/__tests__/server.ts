// A real HTTP and WebSocket server for the remote tests, built on node:http
// only, so the tests use the real fetch and WebSocket instead of mocks.
// HTTP: POST /<case> answers according to <case>. WebSocket: each message is
// answered according to its task name.
import { createHash } from 'node:crypto';
import { createServer, type IncomingMessage } from 'node:http';
import type { AddressInfo, Socket } from 'node:net';

export type TestServerType = {
  http: string;
  ws: string;
  /** WebSocket connections opened so far. */
  connections: () => number;
  /** WebSocket connections the client has closed so far. */
  closedByClient: () => number;
  /** Headers of the last HTTP request. */
  lastHeaders: () => IncomingMessage['headers'] | undefined;
  close: () => Promise<void>;
};

const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

/** A server-to-client text frame (unmasked). */
const frame = (text: string) => {
  const payload = Buffer.from(text);
  const header =
    payload.length < 126
      ? Buffer.from([0x81, payload.length])
      : Buffer.from([0x81, 126, payload.length >> 8, payload.length & 255]);

  return Buffer.concat([header, payload]);
};

/** Client-to-server frames (masked), as { opcode, text }. */
const readFrames = (buffer: Buffer) => {
  const frames: { opcode: number; text: string }[] = [];
  let offset = 0;

  while (offset + 2 <= buffer.length) {
    const opcode = buffer[offset] & 0x0f;
    let length = buffer[offset + 1] & 0x7f;
    let position = offset + 2;

    if (length === 126) {
      length = buffer.readUInt16BE(position);
      position += 2;
    }

    const mask = buffer.subarray(position, position + 4);

    position += 4;

    const data = Buffer.from(buffer.subarray(position, position + length)).map(
      (byte, index) => byte ^ mask[index % 4]
    );

    frames.push({ opcode, text: data.toString() });
    offset = position + length;
  }

  return frames;
};

export const startTestServer = async (): Promise<TestServerType> => {
  const sockets = new Set<Socket>();
  let connections = 0;
  let closedByClient = 0;
  let lastHeaders: IncomingMessage['headers'] | undefined;

  const server = createServer((request, response) => {
    let body = '';

    lastHeaders = request.headers;
    request.on('data', (chunk) => (body += chunk));
    request.on('end', () => {
      const json = (status: number, value: unknown) => {
        response.writeHead(status, { 'content-type': 'application/json' });
        response.end(JSON.stringify(value));
      };

      switch (request.url) {
        case '/ok':
          return json(200, { result: JSON.parse(body) });
        case '/error-string':
          return json(200, { error: 'task failed' });
        case '/error-object':
          return json(200, { error: { code: 'E_TASK', message: 'bad input' } });
        case '/no-result':
          return json(200, { something: 'else' });
        case '/not-json':
          response.writeHead(200, { 'content-type': 'text/plain' });

          return response.end('plain text');
        case '/http-500':
          response.writeHead(500, { 'content-type': 'text/html' });

          return response.end('<html>Internal Server Error</html>');
        case '/http-404':
          return json(404, { result: 'must not count' });
        case '/http-400-error':
          return json(400, { error: 'input must be a string' });
        case '/hang':
          return; // never answers
        default:
          return json(404, { error: 'unknown case' });
      }
    });
  });

  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });

  server.on('upgrade', (request, socket: Socket) => {
    const accept = createHash('sha1')
      .update(`${request.headers['sec-websocket-key']}${GUID}`)
      .digest('base64');

    connections++;
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n' +
        `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
    );

    socket.on('data', (buffer: Buffer) => {
      for (const { opcode, text } of readFrames(buffer)) {
        // A client message can arrive after the server ended the socket
        if (socket.writableEnded || socket.destroyed) return;

        if (opcode === 8) {
          closedByClient++;
          socket.end(Buffer.from([0x88, 0]));

          return;
        }

        const { task, input, id } = JSON.parse(text);
        const reply = (value: unknown) =>
          socket.write(frame(JSON.stringify(value)));

        if (task === 'echo') reply({ id, result: input });
        else if (task === 'fail') reply({ id, error: 'task failed' });
        else if (task === 'malformed') socket.write(frame('this is not json'));
        else if (task === 'null') socket.write(frame('null'));
        else if (task === 'stranger') reply({ id: 9999, result: 'not yours' });
        else if (task === 'close') socket.end(Buffer.from([0x88, 0]));
        // 'hang': never answer
      }
    });
  });

  await new Promise<void>((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve())
  );

  const { port } = server.address() as AddressInfo;

  return {
    http: `http://127.0.0.1:${port}`,
    ws: `ws://127.0.0.1:${port}`,
    connections: () => connections,
    closedByClient: () => closedByClient,
    lastHeaders: () => lastHeaders,
    close: () =>
      new Promise((resolve) => {
        for (const socket of sockets) socket.destroy();

        server.close(() => resolve());
      })
  };
};

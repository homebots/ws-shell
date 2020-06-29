const WebSocket = require('ws');
const childProcess = require('child_process');

let socket;

function setup() {
  socket = new WebSocket('ws://hub.homebots.io/hub/ws-shell');

  socket.on('message', (buffer) => {
    console.log('$', String(buffer).trim());

    try {
      const webSocketStream = WebSocket.createWebSocketStream(socket, { encoding: 'utf8' });
      const shell = childProcess.exec(String(buffer), { stdio: 'pipe' });
      shell.stdout.pipe(webSocketStream);
      shell.stderr.pipe(webSocketStream);

      // shell.on('close', () => socket.send(''));
    } catch (error) {
      socket.send(error.message);
    }
  });

  socket.on('close', setup);
}

setup();
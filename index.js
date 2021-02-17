const WebSocket = require('ws');
const childProcess = require('child_process');

let socket;
let lastError;

function onError(error) {
  console.log((error && error.message) || error);
  lastError = error;
}

function setup() {
  socket = new WebSocket('wss://hub.homebots.io/hub/ws-shell');

  socket.on('message', (buffer) => {
    const command = String(buffer);
    console.log('$', command.trim());

    if (!command.trim()) {
      socket.send('');
      return;
    }

    try {
      const webSocketStream = WebSocket.createWebSocketStream(socket, {
        encoding: 'utf8',
      });
      const shell = childProcess.exec(command, { stdio: 'pipe' });
      shell.on('error', onError);

      shell.stdout.pipe(webSocketStream);
      shell.stderr.pipe(webSocketStream);

      if (shell.killed || shell.exitCode !== 0) {
        socket.send('\n');
      }
    } catch (error) {
      onError(error);
    }
  });

  socket.on('close', setup);
  socket.on('open', () => {
    if (lastError) {
      socket.send(String(lastError.message || lastError));
      lastError = null;
    }
  });
}

setup();

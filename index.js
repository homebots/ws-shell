const WebSocket = require('ws');
const childProcess = require('child_process');

let socket;

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
      shell.stdout.pipe(webSocketStream);
      shell.stderr.pipe(webSocketStream);

      shell.on('close', () => socket.send('[Disconnected]'));

      if (shell.killed || shell.exitCode !== 0) {
        socket.send('');
      }
    } catch (error) {
      socket.send(error.message);
    }
  });

  socket.on('close', setup);
}

setup();

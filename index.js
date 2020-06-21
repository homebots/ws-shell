const WebSocket = require('ws');
const childProcess = require('child_process');

function loop() {
  const socket = new WebSocket('ws://hub.homebots.io/hub/ws-shell');
  const shell = childProcess.spawn('sh', { detached: true, stdio: ['pipe', 'pipe', process.stderr] });
  const webSocketStream = WebSocket.createWebSocketStream(socket, { encoding: 'utf8' });

  webSocketStream.pipe(shell.stdin);
  shell.stdout.pipe(webSocketStream);

  shell.on('close', () => socket.close());

  return shell;
}


let sh;

function setup() {
  console.log('New shell started');

  sh = loop();
  sh.on('close', setup);
}

setup();

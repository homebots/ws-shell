const repl = require('repl');
const WebSocket = require('ws');

const socket = new WebSocket('wss://hub.homebots.io/hub/ws-shell');
let lastCallback = console.log;

function run(cmd, _, __, callback) {
  lastCallback = callback;
  socket.send(cmd);
}

socket.on('message', (buffer) => {
  console.log(buffer.toString('utf-8').trim());
  lastCallback.call(null, null, undefined);
});

const shell = repl.start({
  prompt: '$ ',
  eval: run,
  writer: console.log,
  output: null,
  input: null,
  terminal: false,
  useColors: true,
  ignoreUndefined: true,
  useGlobal: false,
});

shell.on('exit', () => socket.close);

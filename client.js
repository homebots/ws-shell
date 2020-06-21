const repl = require('repl');
const WebSocket = require('ws');

let lastCallback;
const socket = new WebSocket('wss://hub.homebots.io/hub/ws-shell');

function run(cmd, _, __, callback) {
  socket.send(cmd);
  setTimeout(() => callback(null), 1000);
}

socket.on('message', (buffer) => console.log(buffer.toString('utf-8')));

const shell = repl.start({ 
  prompt: '$ ', 
  eval: run, 
  writer: (output) => console.log(output),
  terminal: true, 
  useColors: true, 
  ignoreUndefined: true,
  useGlobal: false,
});

repl.ignoreUndefined = true;
shell.on('exit', () => socket.close);

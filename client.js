const repl = require('repl');
const WebSocket = require('ws');

let lastCallback;
const socket = new WebSocket('wss://hub.homebots.io/hub/ws-shell');

function run(cmd, _, __, callback) {
  socket.send(cmd);
  lastCallback = callback;
}

socket.on('message', (buffer) => {
  let text = buffer.toString('utf-8');

  if (lastCallback) {
    lastCallback(null, text);
    lastCallback = null;
  } else {
    console.log(text);
  }
});

const console = repl.start({ 
  prompt: '$ ', 
  eval: run, 
  writer: (output) => console.log(output),
  terminal: true, 
  useColors: true, 
  ignoreUndefined: true,
  useGlobal: false,
});

console.on('exit', () => socket.close);
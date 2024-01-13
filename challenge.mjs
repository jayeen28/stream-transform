// ALL YOUR CODE SHOULD BE HERE
// DO NOT EDIT THE OTHER FILES
import net from "node:net";
import { EventEmitter } from "node:events";

const PORT = 3031;
const TARGET_PORT = 3032;
const SECRET_DATA_PARTS = 'i like big trains and i cant lie'.toLowerCase().split(' ');
const regex = new RegExp(`\\b${SECRET_DATA_PARTS.join('\\s*')}\\b`, 'gi');

const emitter = new EventEmitter();

let messages = [];
let messageMaxLength = 5;
let forChecking = [];

function tryToForwardMessage(messages) {
    const targetStrings = messages.slice(-messageMaxLength);
    if (targetStrings.length >= messageMaxLength) {
        forChecking.unshift(targetStrings.join('\n'));
        const filtered = targetStrings.join('\n').replace(/\bi\s*like\s*big\s*trains\s*and\s*i\s*cant\s*lie\b/gi, match => match.replace(/[a-z]/g, "-"));
        const message = filtered.split('\n').pop();
        emitter.emit('new_message', message);
        messages.pop();
    }
}

const server = net.createServer();

const target = net.createConnection({ port: TARGET_PORT }, () => {
    console.log('connected to Target!');
    target.write('a');
});

server.on("connection", (conn) => {
    conn.write("WELCOME.\n");
    emitter.on('new_message', (msg) => {
        conn.write(msg + '\n');
    });
});

setTimeout(() => console.log(forChecking), 100000)

target.on('data', (data) => {
    messages.unshift(data.toString().trim());
    tryToForwardMessage(messages);
});

target.on('end', () => {
    console.log('disconnected from target');
});

server.listen(PORT, () => {
    console.log(`STARTED SERVER 0.0.0.0:${PORT}`);
});
// ALL YOUR CODE SHOULD BE HERE
// DO NOT EDIT THE OTHER FILES
import net from "node:net";
import { EventEmitter } from "node:events";

const PORT = 3031;
const TARGET_PORT = 3032;
const SECRET_DATA_PARTS = 'i like big trains and i cant lie'.toLowerCase().split(' ');
const SECRET_DATA_PARTS_LENGTH = SECRET_DATA_PARTS.length;
const regex = new RegExp(`\\b${SECRET_DATA_PARTS.join('\\s*')}\\b`, 'gi');

const emitter = new EventEmitter();

let messages = [];
let messageMaxLength = 5;

function tryToForwardMessage(messages) {
    const strings = messages.slice(-messageMaxLength);
    if (strings.length >= messageMaxLength) {
        const indexAndLength = strings.map(str => {
            const mapping = str.split(' ').map(part => [SECRET_DATA_PARTS.indexOf(part.replace('\n', '')), part.length]);
            return { [str]: mapping };
        });
        console.log(JSON.stringify(indexAndLength));
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
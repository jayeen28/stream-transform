import { Socket } from 'node:net';

const conn = new Socket();
conn.connect(3031, 'localhost');

let buffer = '';
let lastLength = 0;
let lastIncreaseTime = Date.now();

function check() {
    if (buffer.replace(/[\s\n]+/g, '').indexOf('ilikebigtrainsandicantlie') >= 0) {
        console.log(buffer);
        console.log('OH NO :( -- the output should not contain "i like big trains and i cant lie", but it seems it still has it');
        process.exit(0);
    }
}

conn.on('data', (data) => {
    const decoded = data.toString('utf-8');
    buffer += decoded;

    check();
});


setInterval(() => {
    if (buffer.length > lastLength) {
        lastIncreaseTime = Date.now();
    }

    if (lastIncreaseTime < Date.now() - 1000) {
        console.log('OH NO :( -- the output should increase every second or so, but it does not seem to be doing that.');
        process.exit(0);
    }

    lastLength = buffer.length;
}, 500);
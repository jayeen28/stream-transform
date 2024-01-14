// ALL YOUR CODE SHOULD BE HERE
// DO NOT EDIT THE OTHER FILES
// Taken help from chat gpt.
// some comments are written using ChatGPT

// Importing required modules
import net from "node:net";
import { EventEmitter } from "node:events";

// Constants
const PORT = 3031;
const TARGET_PORT = 3032;
const SECRET_DATA_PARTS = 'i like big trains and i cant lie'.toLowerCase().split(' ');
const regex = new RegExp(`${SECRET_DATA_PARTS.join(' ')}`, 'gi');

// Event emitter instance
const emitter = new EventEmitter();

// Message stack
let messages = [];
let messageMaxLength = 2;

/**
 * Adds a trailing space to messages that end with certain words.
 * @param {string[]} messages - Array of messages to process.
 * @returns {string[]} - Processed messages.
 */
function placeTrailingSpace(messages) {
    const data = messages.map((m, i) => {
        const words = m.split(' ');
        const lastWord = words.slice(-1);
        if (SECRET_DATA_PARTS.includes(lastWord)) {//if parts has direct match then place a trailing space.
            return m + ' ';
        } else if (i < (messages.length - 1) && SECRET_DATA_PARTS.some(w => w.startsWith(lastWord))) {// if parts has partial match at the end and also has match with next message starting then don't place trailing space.
            const nextMessageFirstWord = messages[i + 1].split(' ').slice(0, 1);
            const startsWithWords = SECRET_DATA_PARTS.filter((w) => w.startsWith(lastWord));
            const wordFound = startsWithWords.find((w) => w === (lastWord + nextMessageFirstWord));
            if (wordFound) return m;
            else return m + ' ';
        } else return m + '';
    });
    return data;
}

/**
 * Splits a string into substrings based on an array of lengths.
 * @param {string} inputString - The input string to split.
 * @param {number[]} lengths - Array of lengths to split the string.
 * @returns {string[]} - Array of substrings.
 */
function splitStringByLengths(inputString, lengths) {
    let start = 0;
    return lengths.map(length => inputString.substring(start, start += length));
}

/**
 * Tries to forward messages to the target connection.
 * @param {string[]} messages - Array of messages to process.
 */
function tryToForwardMessage(messages) {
    const targetStrings = messages.slice(0, messageMaxLength);//get limited messages
    if (targetStrings.length >= messageMaxLength) {
        const readyMessages = placeTrailingSpace(targetStrings);//place trailing space properly to avoid key leak
        const filtered = readyMessages.join('').replace(regex, match => match.replace(/[a-z]/g, "-"));//join multiple message to avoid key leak between messages.
        const [message1, message2] = splitStringByLengths(filtered, readyMessages.map(m => m.length));//get back to the readyMessage like array without secret key.
        emitter.emit('new_message', message1);//send event to forward message.
        messages.splice(0, messageMaxLength);//remove messages from stack
        messages.unshift(message2);//set message2 again to be filtered with the next message so that partial key gets hidden between messages.
    }
}

// Server setup
const server = net.createServer();

// Target connection setup
const target = net.createConnection({ port: TARGET_PORT }, () => {
    console.log('connected to Target!');
    target.write('a');
});

// Event listener for incoming connections
server.on("connection", (conn) => {
    conn.write("WELCOME.\n");
    // forward message to client
    emitter.on('new_message', (msg) => {
        conn.write(msg + '\n');
    });
});

// Event listener for data received from the target
target.on('data', (data) => {
    messages.push(data.toString().trim());
    tryToForwardMessage(messages);
});

// Event listener for the target connection ending
target.on('end', () => {
    console.log('disconnected from target');
});

// Start the server
server.listen(PORT, () => {
    console.log(`STARTED SERVER 0.0.0.0:${PORT}`);
});

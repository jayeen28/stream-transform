import net from "node:net";

const server = net.createServer();

const needleRaw = "i like big trains and i cant lie";
const needle = needleRaw.split(" ");

const haystack = [
  ...needle,
  ...needle,
  ...needle,
  ...`
        tomato potato mango engine typescript nodejs python photoshop design figma u
        love me hugs brains damascus paris new york class inheritance interface enigma
        ml ai
    `
    .replace(/\s+/g, " ")
    .trim()
    .split(" "),
];

server.on("connection", (conn) => {
  conn.write("WELCOME TO THE CHALLENGE.\n");
  conn.write("SELECT MODE (a / b / c / d): ");

  async function sendData(delay, debug) {
    try {
      const lineLimit = 10_000 + Math.round(Math.random() * 10_000);
      let buffer = "";

      for (let i = 0; i < lineLimit; i++) {
        const lineWidth =
          needleRaw.length + Math.round(Math.random() * needleRaw.length * 2);

        while (buffer.length < lineWidth) {
          if (Math.random() > 0.94) {
            buffer += ` ${needleRaw}`;
          } else {
            const wordIndex = Math.round(Math.random() * (haystack.length - 1));

            if (debug) {
              buffer += ` ${haystack[wordIndex].replace(/[a-z]/g, "-")}`;
            } else {
              buffer += ` ${haystack[wordIndex]}`;
            }
          }
        }

        buffer = buffer.trim();
        const line = buffer.substring(0, lineWidth);
        buffer = buffer.substring(lineWidth);

        conn.write(line + "\n");
        await new Promise((accept) => setTimeout(accept, delay));
      }

      conn.end();
      conn.destroy();
    } catch (error) {
      console.error(error);
    }
  }

  conn.on("data", (data) => {
    const mode = data.readUInt8(0);

    if (String.fromCodePoint(mode) === "a") {
      // slow - prod
      sendData(500, false);
    } else if (String.fromCodePoint(mode) === "b") {
      // slow - debug
      sendData(500, true);
    } else if (String.fromCodePoint(mode) === "c") {
      // fast - prod
      sendData(10, false);
    } else if (String.fromCodePoint(mode) === "d") {
      // fast - debug
      sendData(10, true);
    }
  });

  conn.on("close", () => console.log("closed"));

  conn.on("error", (error) => {
    console.error(error);
  });
});

const port = parseInt(process.env.PORT ?? "3032");

server.listen(port, () => {
  console.log(`STARTED SERVER 0.0.0.0:${port}`);
});

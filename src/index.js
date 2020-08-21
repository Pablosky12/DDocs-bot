import "dotenv/config";

import discord from "discord.js";
import axios from "axios";

const bot = new discord.Client();
bot.login(process.env.BOT_TOKEN);

const EntryTypes = {
  Question: "q",
  Answer: "a",
};

const qnaparser = new RegExp(/[qQaA]:(.*)/);
bot.on("message", (msg) => {
  console.log(msg);
  const firstChars = msg.content.trim().slice(0, 2);

  if (!firstChars.match(qnaparser)) {
    return;
  }

  const entryType = firstChars.charAt(0).toLowerCase();
  const text = msg.content.match(qnaparser)[1];

  const client = axios.create({
    baseURL: process.env.API_URL,
  });

  if (entryType == EntryTypes.Question) {
    const { parentID: server } = msg.channel;
    const { id: author } = msg.author;
    const { id: discordMsgId } = msg;
    client
      .post(`question`, {
        author,
        text,
        server,
        discordMsgId,
        tech: 1,
      })
      .then(console.log)
      .catch(console.log);
  } else if (entryType == EntryTypes.Answer) {
    console.log("answer");
    // logic for adding answer
  }
});

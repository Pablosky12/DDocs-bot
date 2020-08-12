import "dotenv/config";

import discord from "discord.js";

const bot = new discord.Client();
bot.login(process.env.BOT_TOKEN);


const EntryTypes = {
    Question: 'q',
    Answer: 'a',
}
bot.on("message", (msg) => {
  const firstChars = msg.content.trim().slice(0, 2);
  const token = firstChars.match(/[qQaA]:(.*)/);
  if (!token) {
    console.log("no entro");
    return;
  }

  const entryType = firstChars.charAt(0).toLowerCase();

  if (entryType == EntryTypes.Question) {
    // Logic for adding question
    console.log("question");
  } else if (entryType == EntryTypes.Answer) {
    console.log("answer");
    // logic for adding answer
  }
});

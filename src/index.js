import "dotenv/config";

import discord from "discord.js";
import axios from "axios";

const bot = new discord.Client();
bot.login(process.env.BOT_TOKEN);

const qnaparser = new RegExp(/[qQaA]:(.*)/);

const client = axios.create({
  baseURL: process.env.API_URL,
});

bot.on("message", async (msg) => {
  if (msg.content.startsWith("q:")) {
    await addQuestion(msg);
  } else if (msg.content.startsWith("> q:")) {
    await addAnswer(msg);
  }
});

async function addQuestion(msg) {
  const { parentID: server } = msg.channel;
  const { id: author } = msg.author;
  const { id: discordMsgId } = msg;
  const text = msg.content.match(qnaparser)[1];
  client
    .post(`question`, {
      author,
      text,
      server,
      discordMsgId,
      tech: 1,
    })
    .then(console.log);
  // .catch(console.log);
}

async function addAnswer(msg) {
  const { parentID: server } = msg.channel;
  const { id: author } = msg.author;
  const text = msg.content.match(/(?<=\<.*\>).+/)[0];
  const qtext = msg.content
    .match(/(?<= q:)(.*?)(?=<.*)/gs)[0]
    .replace(/\n/g, "");

  const { data: question } = await client.post("question/query", {
    text: qtext,
  });

  try {
    const { data: answerData } = await client.post("answer", {
      author,
      text,
      server,
      tech: question.qtech,
      questionId: question.qid,
    });
    console.log(answerData);
  } catch (e) {
    console.log(e);
  }

}

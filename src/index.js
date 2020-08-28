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
  if (msg.author.bot) return;

  if (msg.content.startsWith("D!")) {
    await setUpBot(msg);
  }

  try {
    if (msg.content.startsWith("q:")) {
      await addQuestion(msg);
      msg.react("✍️");
    } else if (msg.content.startsWith("> q:")) {
      await addAnswer(msg);
      msg.react("✍️");
    }
  } catch {
    console.log("something broke");
  }

});

bot.on("guildCreate", (guild) => {
  console.log("Joined a new guild: " + guild.name);
  console.log(guild);

  let channelID;
  let channels = [...guild.channels.cache];
  for (let c of channels) {
    let channelType = c[1].type;
    if (channelType === "text") {
      channelID = c[0];
      break;
    }
  }
  const channel = bot.channels.cache.get(guild.systemChannelID || channelID);
  channel.send("Thanks for inviting me! Set me up by running D!");
  //Your other stuff like adding to guildArray
});


async function setupBot() {
  
}
async function addQuestion(msg) {
  const { parentID: server } = msg.channel;
  const { id: author } = msg.author;
  const { id: discordMsgId } = msg;
  const text = msg.content.match(qnaparser)[1];
  await client
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

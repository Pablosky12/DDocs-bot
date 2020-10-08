console.log('pepe');
import "dotenv/config";

import discord from "discord.js";
import axios from "axios";

const bot = new discord.Client();
try {
  bot.login(process.env.BOT_TOKEN);
} catch (e) {
  console.log(e);
}

const qnaparser = new RegExp(/[qQaA]:(.*)/);

const client = axios.create({
  baseURL: process.env.API_URL,
});

const Command = {
  AddQuestion: 1,
  AddAnswer: 2,
  Register: 3,
};

const commands = {
  [Command.AddQuestion]: {
    name: Command.AddQuestion,
    handler: addQuestion,
    condition: (msg) => msg.content.startsWith("q:"),
    message: `
      In order to ask a question, just start your message with 'q:' and ask your question as you normally would. 
      If your question is correctly saved a reaction with ✍️ will appear..
    `,
  },
  [Command.AddAnswer]: {
    name: Command.AddAnswer,
    handler: addAnswer,
    condition: (msg) => msg.content.startsWith("> q:"),
    message: `In order to add an aswer to a question you must use the quote functionality for discord, 
    If your answer is correctly saved a reaction with ✍️ will appear.`,
  },
  [Command.Register]: {
    name: Command.Register,
    handler: registerBot,
    condition: (msg) => msg.content.startsWith("dd!"),
    message: `To register the bot you must add a BotOwner role on the channel. A user with the BotOwner role 
    has to call 'dd!' to setup the bot. Follow the instructions that appear next, this will allow you to set a
    technology for the discussions made in this server.
    `,
  },
};

function shouldHandle(msg) {
  return !msg.author.bot || msg.channel.guild;
}

bot.on("message", async (msg) => {
  if (!shouldHandle(msg)) return;

  for (let commandKey in commands) {
    const command = commands[commandKey];
    if (command.condition(msg)) {
      console.log(`entered condition ${command.name}`);
      try {
        command.handler(msg);
        msg.react("✍️");
      } catch (e) {
        console.error(`Something exploded while handling ${command.name}`);
        console.error(e);
      }
      break;
    }
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

async function registerBot() {}
async function addQuestion(msg) {
  const { parentID: server } = msg.channel;
  const { id: author } = msg.author;
  const { id: discordMsgId } = msg;
  const text = msg.content.match(qnaparser)[1];
  await client.post(`question`, {
    author,
    text,
    server,
    discordMsgId,
    tech: 1,
  });
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

  const { data: answerData } = await client.post("answer", {
    author,
    text,
    server,
    tech: question.qtech,
    questionId: question.qid,
  });
}

"use strict";

require("dotenv/config");

var _discord = _interopRequireDefault(require("discord.js"));

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

console.log('pepe');
var bot = new _discord.default.Client();

try {
  bot.login(process.env.BOT_TOKEN);
} catch (e) {
  console.log(e);
}

var qnaparser = new RegExp(/[qQaA]:(.*)/);

var client = _axios.default.create({
  baseURL: process.env.API_URL
});

var Command = {
  AddQuestion: 1,
  AddAnswer: 2,
  Register: 3
};
var commands = {
  [Command.AddQuestion]: {
    name: Command.AddQuestion,
    handler: addQuestion,
    condition: msg => msg.content.startsWith("q:"),
    message: "\n      In order to ask a question, just start your message with 'q:' and ask your question as you normally would. \n      If your question is correctly saved a reaction with \u270D\uFE0F will appear..\n    "
  },
  [Command.AddAnswer]: {
    name: Command.AddAnswer,
    handler: addAnswer,
    condition: msg => msg.content.startsWith("> q:"),
    message: "In order to add an aswer to a question you must use the quote functionality for discord, \n    If your answer is correctly saved a reaction with \u270D\uFE0F will appear."
  },
  [Command.Register]: {
    name: Command.Register,
    handler: registerBot,
    condition: msg => msg.content.startsWith("dd!"),
    message: "To register the bot you must add a BotOwner role on the channel. A user with the BotOwner role \n    has to call 'dd!' to setup the bot. Follow the instructions that appear next, this will allow you to set a\n    technology for the discussions made in this server.\n    "
  }
};

function shouldHandle(msg) {
  return !msg.author.bot || msg.channel.guild;
}

bot.on("message", /*#__PURE__*/function () {
  var _ref = _asyncToGenerator(function* (msg) {
    if (!shouldHandle(msg)) return;

    for (var commandKey in commands) {
      var command = commands[commandKey];

      if (command.condition(msg)) {
        console.log("entered condition ".concat(command.name));

        try {
          command.handler(msg);
          msg.react("✍️");
        } catch (e) {
          console.error("Something exploded while handling ".concat(command.name));
          console.error(e);
        }

        break;
      }
    }
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}());
bot.on("guildCreate", guild => {
  console.log("Joined a new guild: " + guild.name);
  console.log(guild);
  var channelID;
  var channels = [...guild.channels.cache];

  for (var c of channels) {
    var channelType = c[1].type;

    if (channelType === "text") {
      channelID = c[0];
      break;
    }
  }

  var channel = bot.channels.cache.get(guild.systemChannelID || channelID);
  channel.send("Thanks for inviting me! Set me up by running D!"); //Your other stuff like adding to guildArray
});

function registerBot() {
  return _registerBot.apply(this, arguments);
}

function _registerBot() {
  _registerBot = _asyncToGenerator(function* () {});
  return _registerBot.apply(this, arguments);
}

function addQuestion(_x2) {
  return _addQuestion.apply(this, arguments);
}

function _addQuestion() {
  _addQuestion = _asyncToGenerator(function* (msg) {
    var {
      parentID: server
    } = msg.channel;
    var {
      id: author
    } = msg.author;
    var {
      id: discordMsgId
    } = msg;
    var text = msg.content.match(qnaparser)[1];
    yield client.post("question", {
      author,
      text,
      server,
      discordMsgId,
      tech: 1
    });
  });
  return _addQuestion.apply(this, arguments);
}

function addAnswer(_x3) {
  return _addAnswer.apply(this, arguments);
}

function _addAnswer() {
  _addAnswer = _asyncToGenerator(function* (msg) {
    var {
      parentID: server
    } = msg.channel;
    var {
      id: author
    } = msg.author;
    var text = msg.content.match(/(?<=\<.*\>).+/)[0];
    var qtext = msg.content.match(/(?<= q:)([\s\S]*?)(?=<[\s\S]*)/g)[0].replace(/\n/g, "");
    var {
      data: question
    } = yield client.post("question/query", {
      text: qtext
    });
    var {
      data: answerData
    } = yield client.post("answer", {
      author,
      text,
      server,
      tech: question.qtech,
      questionId: question.qid
    });
  });
  return _addAnswer.apply(this, arguments);
}
//# sourceMappingURL=index.js.map
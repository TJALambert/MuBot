const config = require('../CONFIG.json')

let command = "ping"

let ping = {
  command:      command,
  usage:        config.botPrefix + " " + command ,
	description:  "Responds with pong if the bot is alive",
	process: function(bot, msg, suffix) {
		msg.reply("Pong!")
	}
}

module.exports = ping
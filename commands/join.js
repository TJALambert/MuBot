const config = require('../CONFIG.json')

let command = "join"

let join = {
  command:      command,
  usage:        config.botPrefix + " " + command,
	description: "Joins the channel the user is in",
	process: function(bot, msg, suffix) {
	  let channel = msg.member.voiceChannel
	  if (channel) {
	    channel.join()
	  } else {
	    msg.reply("You need to be in a voice channel for me to join!")
	  }
  }
}

module.exports = join
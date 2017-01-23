const config = require('../CONFIG.json')

let command = "resume"

let resume = {
  command:      command,
  usage:        config.botPrefix + " " + command ,
	description: "Resumes playback",
	process: function(bot, msg, suffix) {
	  let connection = bot.voiceConnections.find(voiceConnection => voiceConnection.channel.guild === msg.channel.guild)
	  if (connection) {
	    connection.player.dispatcher.resume()
	  } else {
	    let msgOut = "No voice active!"
	    msg.channel.sendMessage(msgOut)
	  }
  }
}

module.exports = resume
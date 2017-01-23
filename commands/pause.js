const config = require('../CONFIG.json')

let command = "pause"

let pause = {
  command:      command,
  usage:        config.botPrefix + " " + command ,
	description: "Pauses playback",
	process: function(bot, msg, suffix) {
    let connection = bot.voiceConnections.find(voiceConnection => voiceConnection.channel.guild === msg.channel.guild)
    if (connection) {
      connection.player.dispatcher.pause()
    } else {
      let msgOut = "No voice active!"
      msg.channel.sendMessage(msgOut)
    }
  }
}

module.exports = pause
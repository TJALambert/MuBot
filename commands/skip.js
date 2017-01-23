const config = require('../CONFIG.json')

let playlists = require('../utils/playlists.js')

let command = "skip"

let skip = {
  command:      command,
  usage:        config.botPrefix + " " + command + " <[number]|all>",
	description: "Skips a number of songs from the playlist, default value of 1",
	process: function(bot, msg, suffix) {
	  let playlist = playlists.getPlaylist(msg.guild.id)
	  if (playlist) {
	    //playlist.guildPlaylist.shift()
	    let connection = bot.voiceConnections.find(voiceConnection => voiceConnection.channel.guild === msg.channel.guild)
	    if (connection) {
	      console.log(suffix)
	      if (suffix) {
	        if (suffix === "all") {
	          playlist.guildPlaylist.splice(0, playlist.guildPlaylist.length-1)
	        } else {
	          playlist.guildPlaylist.splice(0, suffix-1)
	        }
	      }
	      console.log("End song")
	      connection.player.dispatcher.end()
	    }
	  } else {
	    let msgOut = "Playlist is empty!"
	    msg.channel.sendMessage(msgOut)
	  }
  }
}

module.exports = skip
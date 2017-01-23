const config = require('../CONFIG.json')

let playlists = require('../utils/playlists.js')

let command = "list"

let list = {
  command:      command,
  usage:        config.botPrefix + " " + command,
	description: "Displays current playlist",
	process: function(bot, msg, suffix) {
	  let playlist = playlists.getPlaylist(msg.guild.id)
	  let msgOut = "Playlist:" +'\n'
	  if (playlist) {
  	  if (playlist.guildPlaylist.length > 0) {
  	    for (let i=0; i<playlist.guildPlaylist.length; i++) {
  	      msgOut += playlist.guildPlaylist[i].songName + '\n'
  	    }
  	  } else {
  	    msgOut = "Playlist is empty!"
  	  }
	  } else {
	    msgOut = "Playlist is empty!"
	  }
    msg.channel.sendMessage(msgOut)
  }
}

module.exports = list
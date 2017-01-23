const request = require('superagent')

const config = require('../CONFIG.json')

let playlists = require('../utils/playlists.js')

let command = "q"

let playlistCommand = "pl"

let queue = {
  command:      command,
  usage:        config.botPrefix + " " + command + " <pl|video link> <playlistID>",
	description:  "Adds a video to the music queue",
	process: function(bot, msg, suffix) {
	  // Get parameters after the command
	  let link = suffix.split(" ")[0]
	  
	  if (link) {
	    let connection = bot.voiceConnections.find(voiceConnection => voiceConnection.channel.guild === msg.channel.guild)
	    if (link === playlistCommand) {
	      let plID = suffix.split(" ")[1]
	      // Queuing a playlist
	      if (connection) {
  	      commandPL(bot, null, connection, plID)
  	    } else {
  	      let channel = msg.member.voiceChannel
  	      if (channel) {
  	        commandPL(bot, channel, null, plID)
  	      } else {
  	        msg.reply("you need to be in a voice channel for me to join!")
  	      }
  	    }
	      
	    } else if (link.startsWith('http')) {
	      // Queuing a track
	      if (connection) {
  	      commandQ(bot, null, connection, link)
  	    } else {
  	      let channel = msg.member.voiceChannel
  	      if (channel) {
  	        console.log("Establishing voice connection with " + msg.guild.name)
  	        commandQ(bot, channel, null, link)
  	      } else {
  	        msg.reply("you need to be in a voice channel for me to join!")
  	      }
  	    }
  	    
	    } else {
	      // Unrecognised queue attempt
	    }
	  }
	  
		// Check for voice connection
	  let connection = bot.voiceConnections.find(voiceConnection => voiceConnection.channel.guild === msg.channel.guild)

	}
}


// Initiate voice connection and playlist
// Once initialised callback will add song
function commandQ(bot, channel, connection, link) {
  console.log("being called 2")
  if (connection) {
    if (!channel) {
      channel = connection.channel
    }
    // Connection exists, add song
    let guildID = channel.guild.id
    let playlist = playlists.getPlaylist(guildID)
    if (!playlist) {
      // Create playlist 
      console.log("Creating playlist...")
      playlists.createPlaylist(guildID)
      playlist = playlists.getPlaylist(guildID)
    }
    // Add song
    playlists.addSong(bot, playlist, link)
  } else {
    callbackQ(bot, channel, link)
  }
}

function callbackQ(bot, channel, link) {
  channel.join()
    .then(connection => {
      commandQ(bot, channel, connection, link)
    })
}

// Initiate voice connection and playlist
// Once initialised callback will add playlist tracks
function commandPL(bot, channel, connection, plID) {
  if (connection) {
    if (!channel) {
      channel = connection.channel
    }
    // Connection exists, add playlist
    let guildID = channel.guild.id
    let playlist = playlists.getPlaylist(guildID)
    if (!playlist) {
      // Create playlist 
      console.log("Creating playlist...")
      playlists.createPlaylist(guildID)
      playlist = playlists.getPlaylist(guildID)
    }
    // Add songs
    var requestUrl = 'https://www.googleapis.com/youtube/v3/playlistItems' +
      `?part=contentDetails&maxResults=50&playlistId=`+plID+`&key=`+config.ytKEY;

    request.get(requestUrl).end((error, response) => {
      if (!error && response.statusCode == 200) {
        var body = response.body;
        if (body.items.length == 0) {
          //_BOT.reply(m, 'That playlist has no videos.');
          return;
        }
        var suppress = 0;
        body.items.forEach((elem, idx) => {
          let link = elem.contentDetails.videoId;
          playlists.addSong(bot, playlist, link)
        });
        //spitUp();
      } else {
        //client.reply(m, 'There was an error finding playlist with that id.');
        console.log('There was an error finding playlist with that id.')
        return;
      }
    });
  } else {
    callbackPL(bot, channel, plID)
  }
}

function callbackPL(bot,channel, plID) {
  channel.join()
    .then(connection => {
      commandPL(bot, channel, connection, plID)
    })
}

module.exports = queue


'use strict'

const ytdl = require('ytdl-core')
const ffmpeg = require('ffmpeg')
const request = require('superagent')

const Discord = require('discord.js')
const _BOT = new Discord.Client()

const _TOKEN = 'MjcwNzAwMTM3OTcyNDk4NDQy.C1_sug.BgPTvITkd-hjy1OLQknGdWsRnxo'
const _PREFIX = "+mu"
const _KEY = 'AIzaSyAklDbWbRrrRlJ2ZY5D4hFpFWb1DwYHB5g'

const streamOptions = { seek: 0, volume: 1 }
let curPlaylists = []
// Array of playlists -> Object Guild ID + guild playlist array -> Object song name + song link
// Playlist = {guildID: GUILD.ID, guildPlaylist: [GUILD_PLAYLIST]}
// Guild_Playlist_Item = {songName: SONG.NAME, songLink: SONG.LINK}

var commands = {
  "ping": {
    usage: "+mu ping",
		description: "Responds with pong if the bot is alive",
		process: function(msg, suffix) {
		  msg.reply("Pong!")
		}
	},
  "help": {
    usage: "+mu help",
		description: "Lists all commands",
		process: function(msg, suffix) {
		  let msgOut = "Help:" +'\n```'
			for (let cmd in commands) {
			  msgOut += '\n' + commands[cmd].usage + '\n' + commands[cmd].description +'\n'
      }
      msgOut += "```"
      msg.channel.sendMessage(msgOut)
    }
	},
	"q": {
		usage: "+mu q <video link>",
		description: "Adds a video to the music queue",
		process: function(msg, link) {
		  // Check for voice connection
		  let connection = _BOT.voiceConnections.find(voiceConnection => voiceConnection.channel.guild === msg.channel.guild)
		  if (connection) {
		    // Add song to the queue
		    commandQ(null, connection, link)
		  } else {
		    // Check if user is in voice channel
		    let channel = msg.member.voiceChannel
		    if (channel) {
		      // Connect to users voice channel
		      console.log("Establishing voice connection with " + msg.guild.name)
		      commandQ(channel, null, link)
		    } else {
		      msg.reply("you need to be in a voice channel for me to join!")
		    }
		  }
		}
	},
	"pl": {
		usage: "+mu pl <playlist id>",
		description: "Adds up to 50 songs from a playlist to the queue",
		process: function(msg, link) {
		  // Check for voice connection
		  let connection = _BOT.voiceConnections.find(voiceConnection => voiceConnection.channel.guild === msg.channel.guild)
		  if (connection) {
		    // Add playlist to the queue
		    commandPL(null, connection, link)
		  } else {
		    // Check if user is in voice channel
		    let channel = msg.member.voiceChannel
		    if (channel) {
		      // Connect to users voice channel
		      console.log("Establishing voice connection with " + msg.guild.name)
		      commandPL(channel, null, link)
		    } else {
		      msg.reply("you need to be in a voice channel for me to join!")
		    }
		  }
		}
	},
	"list": {
    usage: "+mu list",
		description: "Displays current playlist",
		process: function(msg, suffix) {
		  let playlist = curPlaylists.find(function (playlist) { return playlist.guildID === msg.guild.id})
		  let msgOut = "Playlist:" +'\n```'
		  if (playlist.guildPlaylist.length > 0) {
		    for (let i=0; i<playlist.guildPlaylist.length; i++) {
		      msgOut += playlist.guildPlaylist[i].songName + '\n'
		    }
		    msgOut += "```"
		  } else {
		    msgOut = "Playlist is empty!"
		  }
      msg.channel.sendMessage(msgOut)
    }
	},
	"skip": {
    usage: "+mu skip <empty>|<amount>|<all>",
		description: "Skips current song in the playlist",
		process: function(msg, suffix) {
		  let playlist = curPlaylists.find(function (playlist) { return playlist.guildID === msg.guild.id})
		  if (playlist) {
		    //playlist.guildPlaylist.shift()
		    let connection = _BOT.voiceConnections.find(voiceConnection => voiceConnection.channel.guild === msg.channel.guild)
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
	},
}

_BOT.on('ready', () => {
  console.log('MuBot ready!')
})

_BOT.on('message', msg => {
  //The bot ignores messages that don't start with the prefix or are from a bot
	if (!msg.content.startsWith(_PREFIX) || msg.author.bot) {return}
	
	let msgCmd = msg.content.split(" ")[1]
  
  for (let cmd in commands) {
    if (msgCmd === cmd) {
      let msgSuffix = msg.content.replace(_PREFIX + " " + msgCmd + " ", "")
      commands[cmd].process(msg, msgSuffix)
    }
  }
  
})

function addSpaces(str, size) {
  while (str.length < size) {
    str += " "
  }
  return str
}

// Initiate voice connection and playlist
function commandQ(channel, connection, link) {
  if (connection) {
    if (!channel) {
      channel = connection.channel
    }
    // Connection exists, add song
    let guildID = channel.guild.id
    let playlist = curPlaylists.find(function (playlist) { return playlist.guildID === guildID})
    if (!playlist) {
      // Create playlist 
      console.log("Creating playlist...")
      let guildPlaylist = []
      playlist = { guildID: guildID, guildPlaylist: guildPlaylist }
      curPlaylists.push(playlist)
    }
    // Add song
    ytdl.getInfo(link, function (err, info) {
    if (!info) {
      console.log('Cannot load info from link')
    } else {
      let name = info.title
      playlist.guildPlaylist.push({songName: name, songLink: link})
      console.log('Queued video: ' + name)
      if (playlist.guildPlaylist.length === 1) {
        playNext(guildID)
      }
    }
    if (err) { console.error(err) }
  })
    
  } else {
    callbackQ(channel, link)
  }
}

function callbackQ(channel, link) {
  channel.join()
    .then(connection => {
      commandQ(channel, connection, link)
    })
}

function commandPL(channel, connection, link) {
  if (connection) {
    if (!channel) {
      channel = connection.channel
    }
    // Connection exists, add playlist
    let guildID = channel.guild.id
    let playlist = curPlaylists.find(function (playlist) { return playlist.guildID === guildID})
    if (!playlist) {
      // Create playlist 
      console.log("Creating playlist...")
      let guildPlaylist = []
      playlist = { guildID: guildID, guildPlaylist: guildPlaylist }
      curPlaylists.push(playlist)
    }
    // Add songs
    var requestUrl = 'https://www.googleapis.com/youtube/v3/playlistItems' +
      `?part=contentDetails&maxResults=50&playlistId=`+link+`&key=`+_KEY;

    request.get(requestUrl).end((error, response) => {
      if (!error && response.statusCode == 200) {
        var body = response.body;
        if (body.items.length == 0) {
          //_BOT.reply(m, 'That playlist has no videos.');
          return;
        }
        var suppress = 0;
        body.items.forEach((elem, idx) => {
          var vid = elem.contentDetails.videoId;
          commandQ(null, connection, vid)
        });
        //spitUp();
      } else {
        //client.reply(m, 'There was an error finding playlist with that id.');
        console.log('There was an error finding playlist with that id.')
        return;
      }
    });
  } else {
    callbackPL(channel, link)
  }
}

function callbackPL(channel, link) {
  channel.join()
    .then(connection => {
      commandPL(channel, connection, link)
    })
}

function playNext(guildID) {
  let playlist = curPlaylists.find(function (playlist) { return playlist.guildID === guildID})
  let guildPlaylist = playlist.guildPlaylist
  let connection = _BOT.voiceConnections.find(voiceConnection => voiceConnection.channel.guild.id === guildID)
  if (!guildPlaylist.length) {
    connection.disconnect()
  } else {
    const stream = ytdl(guildPlaylist[0].songLink, {filter: 'audioonly'})
    console.log('Now Playing ' + guildPlaylist[0].songName)
    const dispatcher = connection.playStream(stream, streamOptions)
    dispatcher.on('start', function () {
      console.log('Song started')
    })
    dispatcher.on('end', function () {
      console.log('Song ended')
      guildPlaylist.shift()
      playNext(guildID)
    })
    dispatcher.on('error', function () {
      console.log("error")
      console.error
    })
  }
}

_BOT.login(_TOKEN)
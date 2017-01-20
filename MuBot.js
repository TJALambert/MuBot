'use strict'

const fs = require('fs')
const ytdl = require('ytdl-core')
const ffmpeg = require('ffmpeg')

const Discord = require('discord.js')
const _BOT = new Discord.Client()

const _TOKEN = INSERTTOKENHERE
const _PREFIX = "+mu"

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
		    // Add song(s) to the queue
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
    usage: "+mu skip",
		description: "Skips current song in the playlist",
		process: function(msg, suffix) {
		  let playlist = curPlaylists.find(function (playlist) { return playlist.guildID === msg.guild.id})
		  if (playlist) {
		    //playlist.guildPlaylist.shift()
		    let connection = _BOT.voiceConnections.find(voiceConnection => voiceConnection.channel.guild === msg.channel.guild)
		    if (connection) {
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
    dispatcher.on('end', function () {
      console.log('Song ended')
      guildPlaylist.shift()
      playNext(guildID)
    })
    dispatcher.on('error', function () {
      console.log(err)
    })
  }
}

_BOT.login(_TOKEN)

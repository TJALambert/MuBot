'use strict'

const ytdl = require('ytdl-core')
const ffmpeg = require('ffmpeg')


const config = require('./CONFIG.json')
const Discord = require('discord.js')
const _BOT = new Discord.Client()

const _TOKEN = config.botToken
const _PREFIX = config.botPrefix
const _KEY = config.ytKEY


const streamOptions = { seek: 0, volume: 1 }
let curPlaylists = []
// Array of playlists -> Object Guild ID + guild playlist array -> Object song name + song link
// Playlist = {guildID: GUILD.ID, guildPlaylist: [GUILD_PLAYLIST]}
// Guild_Playlist_Item = {songName: SONG.NAME, songLink: SONG.LINK}

var commands = require('./COMMANDS')

_BOT.on('ready', () => {
  console.log('MuBot ready!')
})

_BOT.on('message', msg => {
  //The bot ignores messages that don't start with the prefix or are from a bot
	if (!msg.content.startsWith(_PREFIX) || msg.author.bot) {return}
	
	let msgCmd = msg.content.split(" ")[1]
  
  for (let cmd in commands) {
    if (msgCmd === commands[cmd].command) {
      let msgSuffix = msg.content.replace(_PREFIX + " " + msgCmd + " ", "")
      commands[cmd].process(_BOT, msg, msgSuffix)
    }
  }
  
})

function addSpaces(str, size) {
  while (str.length < size) {
    str += " "
  }
  return str
}

_BOT.login(_TOKEN)
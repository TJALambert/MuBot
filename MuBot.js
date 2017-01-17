'use strict'

const fs = require('fs')
const ytdl = require('ytdl-core')

const Discord = require('discord.js')
const _BOT = new Discord.Client()

const _TOKEN = INSERTYOURTOKEN
const _PREFIX = "+mu"

var commands = {
  "ping": {
    usage: "+mu ping",
		description: "Responds with pong if the bot is alive",
		process: function(bot, msg, suffix) {
		  msg.reply("Pong!")
		}
	},
  "help": {
    usage: "+mu help",
		description: "Lists all commands",
		process: function(bot, msg, suffix) {
		  let msgOut = "Help:" +'\n```'
			for (let cmd in commands) {
			  msgOut += '\n' + addSpaces(cmd, 8) + "| " + commands[cmd].usage
      }
      msgOut += "```"
      msg.channel.sendMessage(msgOut)
    }
	},
	"q": {
		usage: "+mu q <video link>",
		description: "Adds a video to the music queue",
		process: function(bot, msg, suffix) {
		  //TODO
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
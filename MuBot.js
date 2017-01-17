'use strict'

const fs = require('fs')
const ytdl = require('ytdl-core')

const Discord = require('discord.js')
const _BOT = new Discord.Client()

const _TOKEN = INSERTYOURTOKEN
const _PREFIX = "+mu"

var commands = {}

_BOT.on('ready', () => {
  console.log('MuBot ready!')
})

_BOT.on('message', msg => {
  //The bot ignores messages that don't start with the prefix or are from a bot
	if (!msg.content.startsWith(_PREFIX) || msg.author.bot) {return}
  
})

_BOT.login(_TOKEN)
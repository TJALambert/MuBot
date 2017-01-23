const ytdl = require('ytdl-core')
const ffmpeg = require('ffmpeg')
const request = require('superagent')
const streamOptions = { seek: 0, volume: 1 }

let playlists = []
// Array of playlists -> Object Guild ID + guild playlist array -> Object song name + song link
// Playlist = {guildID: GUILD.ID, guildPlaylist: [GUILD_PLAYLIST]}
// Guild_Playlist_Item = {songName: SONG.NAME, songLink: SONG.LINK}

function createPlaylist(guildID) {
  let guildPlaylist = []
  let playlist = { guildID: guildID, guildPlaylist: guildPlaylist }
  playlists.push(playlist)
}

function getPlaylist(guildID) {
  let playlist = playlists.find(function (playlist) { return playlist.guildID === guildID})
  if (!playlist) {
    console.log("No playlist exists for guild: " + guildID)
    return null
  } else {
    return playlist
  }
}

function addSong(bot, playlist, link) {
  ytdl.getInfo(link, function (err, info) {
    if (!info) {
      console.log('Cannot load info from link')
    } else {
      let name = info.title
      playlist.guildPlaylist.push({songName: name, songLink: link})
      console.log('Queued video: ' + name)
      if (playlist.guildPlaylist.length === 1) {
        playNext(bot, playlist)
      }
    }
    if (err) { console.error(err) }
  })
}

function playNext(bot, playlist) {
  let guildPlaylist = playlist.guildPlaylist
  let connection = bot.voiceConnections.find(voiceConnection => voiceConnection.channel.guild.id === playlist.guildID)
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
      playNext(bot, playlist)
    })
    dispatcher.on('error', function () {
      console.log("error")
      console.error
    })
  }
}

module.exports = {
  list: playlists,
  createPlaylist: createPlaylist,
  getPlaylist: getPlaylist,
  addSong: addSong,
  playNext: playNext
}
//require the lib
const tmi = require('tmi.js')
const fetch = require('node-fetch')
const {channel} = require("tmi.js/lib/utils");
require('dotenv').config({path: __dirname + '/.env'})

//establish a tmi.js client as a listener
const client = new tmi.Client({
    //basic options
    options: { debug: true },
    connection: {
        secure: true,
        reconnect: true
    },

    identity: {
        username: 'EiShroom',
        password: process.env.TWITCH_OAUTH_TOKEN
    },

    //Channel connecting to
    channels: [ 'EiShroom' ]
});

client.connect();

// the actual reporting event

client.on('message', (channel, tags, message, self) => {
    if(self) return
    if (message.toLowerCase() === '!marco') {
        client.say(channel, `Polo!`);
    }
    if (message.toLowerCase() === '!rank') {
        rankFetch(channel)
    }
    console.log(`${tags['display-name']}: ${message}`);
});

const rankFetch = async (channel) => {
    const accountUrl = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/Streyito?api_key=${process.env.API_KEY}`

    let result = await fetch(accountUrl)

    const id = JSON.parse(await result.text()).id

    const rankUrl = await `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}?api_key=${process.env.API_KEY}`

    result = await fetch(rankUrl)

    data = JSON.parse(await result.text())

    rankSpeak(channel, data)
}

const rankSpeak = (channel, data) => {
    const {summonerName, tier, rank, leaguePoints} = data[0]

    client.say(channel, `${summonerName} is currently ${tier} ${rank} with ${leaguePoints} LP.`)
}
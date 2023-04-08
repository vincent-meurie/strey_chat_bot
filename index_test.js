//require the lib
const tmi = require('tmi.js')
const fetch = require('node-fetch')
const {channel} = require("tmi.js/lib/utils");
require('dotenv').config({path: __dirname + '/.env'})

//establish a tmi.js client as a listener
const client = new tmi.Client({
    //basic options
    options: {debug: true},
    connection: {
        secure: true,
        reconnect: true
    },

    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN
    },

    //Channel connecting to
    channels: ['Strey_LoL']
});

client.connect();

// the actual reporting event

var canSendMessage = true;

client.on('message', (channel, tags, message, self) => {
    if (self || !message.startsWith('!')) return;


    const args = message.slice(1).split(' ')
    const command = args.shift().toLowerCase();

    if (canSendMessage) {
        if (command === 'rank') {
            rankFetch(channel, args);
            canSendMessage = false;
        }
    }

    setTimeout(function () {
        canSendMessage = true;
    }, 2000);
    console.log(`${tags['display-name']}: ${message}`);
});

const rankFetch = async (channel, args) => {
    const accountUrl = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${args.join('%20')}?api_key=${process.env.API_KEY}`

    let result = await fetch(accountUrl)

    const id = JSON.parse(await result.text()).id

    const rankUrl = await `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}?api_key=${process.env.API_KEY}`

    result = await fetch(rankUrl)

    data = JSON.parse(await result.text())

    rankSpeak(channel, data)
}

const rankSpeak = (channel, data) => {

    const capitalize = (s) => {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
    }

    try {

        /*
        if (typeof data[1] !== 'undefined') {
            data[0] = data[1]
        }

         */

        for (let i=0; i < data.length; i++) {
            if (data[i].queueType === "RANKED_SOLO_5x5") {
                const {summonerName, tier, rank, leaguePoints} = data[i]

                if (tier === "MASTER" || tier === "GRANDMASTER" || tier === "CHALLENGER") {
                    client.say(channel, `${summonerName} est actuellement ${capitalize(tier.toLowerCase())} avec ${leaguePoints} LP.`)
                } else {
                    client.say(channel, `${summonerName} est actuellement ${capitalize(tier.toLowerCase())} ${rank} avec ${leaguePoints} LP.`)
                }
            }
        }

        if (data.length === 1 && data[0].queueType === "RANKED_FLEX_SR") {
            const {summonerName, tier, rank, leaguePoints} = data[0]

            if (tier === "MASTER" || tier === "GRANDMASTER" || tier === "CHALLENGER") {
                client.say(channel, `${summonerName} est actuellement ${capitalize(tier.toLowerCase())} avec ${leaguePoints} LP en Flex.`)
            } else {
                client.say(channel, `${summonerName} est actuellement ${capitalize(tier.toLowerCase())} ${rank} avec ${leaguePoints} LP en Flex.`)
            }
        }

        if (typeof data.length === "undefined") {
            client.say(channel, `Nom d'invocateur invalide ou invocateur non classé.`)
        }


        /*
        const {summonerName, tier, rank, leaguePoints} = data[0]

        if (tier === "MASTER" || tier === "GRANDMASTER" || tier === "CHALLENGER") {
            client.say(channel, `${summonerName} est actuellement ${capitalize(tier.toLowerCase())} avec ${leaguePoints} LP.`)
        } else {
            client.say(channel, `${summonerName} est actuellement ${capitalize(tier.toLowerCase())} ${rank} avec ${leaguePoints} LP.`)
        }

         */
    } catch (e) {
        client.say(channel, `Invalid or unranked Summoner name.`)
    }
}
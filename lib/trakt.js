
const watchedBitfield = require('stremio-watched-bitfield');
const StremioAPIClient = require('stremio-api-client').StremioAPIClient;
const fetch = require('node-fetch');
const { MetaVideos } = require('./helper.js');

async function TraktData(access_token, endpoint = 'https://www.strem.io/trakt') {
    try {
        if (!access_token) throw "no Ids";
        const url = `${endpoint}/watched.json?token=${access_token}`;
        return await request({ url })
    } catch (e) {
        console.error(e);
    }

    async function request({ method = 'get', url }) {
        console.log(url);
        let opts = {
            method
        };
        try {
            const response = await fetch(url, opts);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error)
            throw new Error(`Error making request: ${error.message}`);
        }
    }
}

async function SyncWatched(authKey) {
    let API = new StremioAPIClient({ endpoint: "https://api.strem.io", authKey })

    try {
        let data = await API.request("datastoreGet", { "collection": "libraryItem", "all": true })
        let userData = await API.request("getUser")
        if (!userData?.trakt?.access_token) throw "trakt not authenticated"
        const access_token = userData.trakt.access_token
        console.log("access_token", access_token)
        let watched = await TraktData(access_token).then(elements => {
            const watched = {};
            elements.forEach(element => {
                watched[element.type] = element.data;
            })
            return watched;
        });



        let watchedMovies = (await SyncWatchedMovies(data, watched.movies)) || [];
        let WatchedSeries = (await SyncWatchedSeries(data, watched.shows)) || [];

        let changes = [...watchedMovies, ...WatchedSeries];

        let datastorePut = await API.request("datastorePut", { "collection": "libraryItem", "changes": changes })

        console.log(changes);

        if (datastorePut.success) {
            console.log('SyncWatched Done');
        } else {
            console.log('error SyncWatched', datastorePut);
            throw ('error SyncWatched');
        }
    } catch (e) {
        console.error(e);
        throw (e);
    }
}

async function SyncWatchedMovies(data, movies) {
    try {
        let changes = [];
        movies.forEach(element => {
            let ids = element.movie.ids;
            let id = ids.imdb || 'trakt:' + ids.trakt;
            let meta = data.filter(element => { return element._id == id })
            let change = {};

            if (meta?.length) {
                meta = meta[0]
                change = meta;
                if (!meta.state.lastWatched || meta.state.lastWatched != element["last_watched_at"]) {
                    change.state.lastWatched = meta.state.lastWatched > element["last_watched_at"] ? meta.state.lastWatched : element["last_watched_at"];
                    change.state.timesWatched = 1;
                    //change.state.video_id = change.state.video_id || id;
                }
            } else {
                change = {
                    "_id": id,
                    "_ctime": new Date().toISOString(),
                    "state": {
                        "lastWatched": element["last_watched_at"],
                        "timesWatched": element.plays,
                        //"video_id": id,
                        "noNotif": false
                    },
                }

            };

            if (!change.poster && ids.imdb) change.poster = `https://images.metahub.space/poster/small/${id}/img`;

            change.name = change.name || element.movie.title
            change.type = change.type || "movie"
            change.posterShape = change.posterShape || "poster"
            change.year = change.year || element.movie.year
            change.behaviorHints = { defaultVideoId: change._id, hasScheduledVideos: false }
            change.removed = false;
            change.temp = false;


            change._mtime = new Date().toISOString();

            changes.push(change)
        });
        return changes;
    } catch (e) { console.error(e); }
}

async function SyncWatchedSeries(data, shows) {
    try {
        let changes = [];
        let showsIds = shows.map(element => { return element?.show?.ids?.imdb })
        let videos = await MetaVideos(showsIds)
        if (!videos) throw "error getting videos from cinimeta";
        shows.forEach(element => {
            if (!element.show) return;
            let ids = element.show.ids;
            let id = ids.imdb; // || 'trakt:' + ids.trakt;
            if (!id) return;

            let meta = data.filter(element => { return element._id == id })
            let change = {};
            if (meta?.length) {
                meta = meta[0]

                change = meta;
                if (!meta.state.lastWatched || meta.state.lastWatched != element["last_watched_at"]) {
                    change.state.lastWatched = meta.state.lastWatched > element["last_watched_at"] ? meta.state.lastWatched : element["last_watched_at"];
                    change.state.timesWatched = 1;
                    //change.state.video_id = change.state.video_id || id;
                }
            } else {
                change = {
                    "_id": id,
                    "_ctime": new Date().toISOString(),
                    "state": {
                        "lastWatched": element["last_watched_at"],
                        "timesWatched": element.plays,
                        //"video_id": id,
                        "noNotif": false
                    },
                }

            };

            if (!change.poster && ids.imdb) change.poster = `https://images.metahub.space/poster/small/${id}/img`;

            change.name = change.name || element.show.title
            change.type = change.type || "series"
            change.posterShape = change.posterShape || "poster"
            change.year = change.year || element.show.year
            //change.behaviorHints = { defaultVideoId: change._id, hasScheduledVideos: false }
            change.removed = false;
            change.temp = false;

            let videosMeta = videos.filter(element => element.id == id)[0];
            change.state.watched = Watchedseries(element, videosMeta);

            change._mtime = new Date().toISOString();

            changes.push(change)
        }); return changes;
    } catch (e) { console.error(e); }
}

function Watchedseries(element, meta) {
    let ids = meta.videos;
    let watched = element?.state?.watched;
    let wb;
    if (watched) {
        wb = watchedBitfield.constructAndResize(watched, ids)
    } else {
        let bitArray = new Array(ids.length).fill(0);
        wb = watchedBitfield.constructFromArray(bitArray, ids)
    }


    element.seasons.forEach(season => {
        season.episodes.forEach(episode => {
            wb.setVideo(`${meta.id}:${season.number}:${episode.number}`, true)
        })
    })
    return wb.serialize() || '';

}


module.exports = SyncWatched;

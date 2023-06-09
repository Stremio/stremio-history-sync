const fetch = require('node-fetch') ;

async function MetaVideos(Ids = []) {
    try {
        if (!Ids.length) throw "no Ids";
        const url = "https://v3-cinemeta.strem.io/catalog/series/video-ids/imdbIds=";

        const promises = [];
        while (Ids.length) {
            currentIds = Ids.slice(0, 100);
            Ids = Ids.slice(100, Ids.length);
            promises.push(request({ url: url + currentIds.toString() }))
        }
        return await Promise.all(promises).then(promises => promises.flat())

    } catch (e) {
        console.error(e);
        return [];
    }

    async function request({ method = 'get', url, data }) {
        console.log(url);
        let opts = {
            method,
            headers: {
                'Content-Type': "application/json",
            }
        };
        if (data) opts.body = JSON.stringify(data);

        try {
            const response = await fetch(url, opts);
            const data = await response.json();
            return data.metasDetailed;
        } catch (error) {
            console.error(error)
            throw new Error(`Error making request: ${error.message}`);
        }
    }
}

async function TraktData(access_token) {
    const headers = {
        'Content-Type': "application/json",
        "trakt-api-version": 2,
        "Accept-Encoding": "*",
        'trakt-api-key': "18bde7dcd858c86f9593addf9f66528f8c1443ec1bef9ecee501d1c5177ce281",
        //"0e861f52c7365efe6da5ea3e2e6641b8d25d87aca3133e8d4f7dc8487368d14b"
    };

    const url = "https://api.trakt.tv/sync/watched";
    const promises = [];
    let moviesPromise = request({ url: url + "/movies" }).then(data => { return { movies: data } })
    let showsPromise = request({ url: url + "/shows" }).then(data => { return { shows: data } })
    promises.push(moviesPromise, showsPromise)

    return await Promise.all(promises).then(promises => {
        const result = promises.reduce((acc, item) => {
            if (!item) return;
            const key = Object.keys(item)[0];
            return { ...acc, [key]: item[key] };
        }, {});

        return result;
    })

    /*
    return await Promise.allSettled(promises).then(promises => {

        promises = promises.map(promise => promise.value)
        const result = promises.reduce((acc, item) => {
            if (!item) return;
            const key = Object.keys(item)[0];
            return { ...acc, [key]: item[key] };
        }, {});

        return result;
    })*/
    async function request({ method = 'get', url }) {
        let opts = {
            method,
            headers: {
                ...headers,
                Authorization: `Bearer ${access_token}`
            }
        };
        try {
            const response = await fetch(url, opts);
            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error(`Error making request: ${error.message}`);
        }
    }
}

module.exports = { TraktData, MetaVideos }
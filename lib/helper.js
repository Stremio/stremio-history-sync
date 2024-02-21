const fetch = require('node-fetch') ;

async function MetaVideos(Ids = []) {
    try {
        if (!Ids.length) throw "no Ids";
        const url = "https://v3-cinemeta.strem.io/catalog/series/video-ids/imdbIds=";

        const promises = [];
        while (Ids.length) {
            let currentIds = Ids.slice(0, 100);
            Ids = Ids.slice(100, Ids.length);
            promises.push(request({ url: url + currentIds.toString() }))
        }
        return await Promise.all(promises).then(promises => promises.flat())

    } catch (e) {
        console.error(e);
        return [];
    }

    async function request({ method = 'get', url, data }) {
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

module.exports = { MetaVideos }
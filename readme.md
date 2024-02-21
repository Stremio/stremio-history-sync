# Stremio History Sync

This project is a Node.js module that synchronizes watched movies and series from different sources to Stremio.
Currently only supporting Trakt.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Usage
This module exports a single function traktSync which can be used as follows:

### Node.js
install the dependency:
```bash
npm i git+https://github.com/stremio/stremio-history-sync.git
```
Then you can import then use the functions in your JavaScript code:
```javascript
const historySync = require('stremio-history-sync');
historySync.traktSync(authKey); // stremio API key
```

### Browser
Include the compiled script in your HTML file:
```HTML
<script src="dist/historySync.js"></script>
```
Then you can use the functions in your JavaScript code:
```javascript
historySync.traktSync(authKey); // stremio API key
```

authKey is the authentication key for the Stremio API.

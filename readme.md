# Stremio History Sync

This project is a Node.js module that synchronizes watched movies and series from different sources to Stremio.
Currently only supporting Trakt.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Installing

1. Clone the repository
```bash
git clone https://github.com/stremio/stremio-history-sync.git
```

2. Install the dependencies
```bash
npm install
```

3. Build the project
```bash
npm run build
```
1. Start the application
```bash
node index.js
```

## Usage
This module exports a single function traktSync which can be used as follows:

### Node.js
install the dependency:
```bash
npm i git+https://github.com/stremio/stremio-history-sync.git
```
Then you can import then use the traktSync function in your JavaScript code:
```javascript
const { traktSync } = require('stremio-history-sync');
traktSync(authKey); // stremio API key
```
### Browser
Include the compiled script in your HTML file:
```HTML
<script src="dist/historySync.js"></script>
```
Then you can use the traktSync function in your JavaScript code:
```javascript
traktSync(authKey); // stremio API key
```

authKey is the authentication key for the Stremio API.

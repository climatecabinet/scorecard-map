# Map for the Climate Cabinet Scorecard

## Installation
To start developing locally, first make sure Gatsby is installed
```
npm install gatsby
```
Next, clone the repo and `cd` into the new git repo
```
git clone https://github.com/climatecabinet/scorecard-map.git
cd scorecard-map
```

## Development
To start the local development server, run
```
npm run develop
```

## How to refresh the map files?
1. Run the following script
```(shell)
$ python scripts/all.py
``` 
2. Upload both files to the Climate Cabinet ArcGIS Developer Account
3. Convert feature layers into vector tile layers
4. Make both files publicly available (Settings -> Layer Access -> Change from Private to Public)
5. Update the map layer links in the `config/map.js` file

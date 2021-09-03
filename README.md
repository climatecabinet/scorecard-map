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
1. Run scripts in the `script` folder in this order: (1) fetch, (2) process, (3) clean, (4) fetch
2. Create a new folder in data/geospatial. Name it `arcgis`
3. In the `arcgis` folder, create two additional folders: `house` and `senate`
4. In the `house` folder, paste the recently created priority house district files (in `appended-state-leg/house` folder; states like MN, MD, NJ, etc.) and nonpriority state files (in `state` folder; states like AL, PR, HI, etc.)
5. In the `senate` folder, paste the recently created priority senate district files (in `appended-state-leg/senate` folder; states like MN, MD, NJ, etc.) and nonpriority state files (in `state` folder; states like AL, PR, HI, etc.)
6. In the terminal, `cd` into the `arcgis` folder
7. Run this command to create a 'stitched' map layer for the House/Lower Chamber: `geojson-merge house/*.geojson > all-house.geojson`
8. Run this command to create a 'stitched' map layer for the Senate/Upper Chamber: `geojson-merge senate/*.geojson > all-senate.geojson`
9. Reduce the size of the files, to 20.1%, with [mapshaper](mapshaper.org)'s simplify feature.
10. Export both files, but renamed as `all-house-reduced.geojson` or `all-senate-reduced.geojson`
11. Upload both files to the Climate Cabinet ArcGIS Developer Account
12. Convert feature layers into vector tile layers
13. Make both files publicly available (Settings -> Layer Access -> Change from Private to Public)
14. Update the map layer links in the `map.js` file

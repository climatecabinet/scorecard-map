""" script to fetch shp files from US Census Bureau Tiger
credit to @openstates/openstates-geo

data source: US Census Bureau Tiger (www2.census.gov/geo/tiger/TIGER2020)
data documentation: https://www2.census.gov/geo/pdfs/maps-data/data/tiger/tgrshp2019/TGRSHP2019_TechDoc.pdf
data fields:
- - STATEFP, state fips code, 12
- - SLDLST, state leg district number, 010
- - GEOID, state leg chamber + district number, State House District 10
- - LSAD, chamber level, LL
- - LSY, legislative session year, 2018
- - MTFCC, MAF/TIGER feature class code, G5220
- - FUNCSTAT, Current functional status, N
- - ALAND, district land area, 6837821870 (units?)
- - AWATER, district water area, 42620795 (unts?)
- - INTPTLAT, latitude, +30.2926978
- - INTPTLON, longitude, -082.7108549

process:
step 1: download shp files from the Census
step 2: unzip and store them

script 1/4
"""

# import libraries
import zipfile
import requests
import us
from pathlib import Path

# download shp files from the Census
# note: The Census download URLs are case-sensitive
YEAR = "2020"
URL = "https://www2.census.gov/geo/tiger/TIGER{year}/SLD{chamber_uppercase}/tl_{year}_{fips}_sld{chamber}.zip"
OUT = Path("data/geospatial/fetch/")

# make folder if it doesnt exist
OUT.mkdir(parents=True, exist_ok=True)

# for every state, including PR and Alaska
for state in us.STATES:
    print("Fetching shapefiles for {}".format(state.name))

    # get and save the shapefile for the whole state
    response = requests.get(state.shapefile_urls('state'))
    response.raise_for_status()

    state_shp = OUT / Path(response.url).name

    with open(state_shp, "wb") as f:
        f.write(response.content)
    with zipfile.ZipFile(state_shp, "r") as f:
        f.extractall(OUT)

    # creating variables for the URL
    for chamber in ["l", "u"]:
        fips = state.fips

        if state.abbr in ("DC", "NE") and chamber == "l":
            # skip lower chamber of the unicamerals
            continue

        # skip if we already have this file
        if (OUT / f"tl_{YEAR}_{fips}_sld{chamber}.shp").exists():
            print(f"skipping {state} {fips} sld{chamber}")
            continue

        # completed URL
        download_url = URL.format(
            fips=fips, chamber=chamber, chamber_uppercase=chamber.upper(), year=YEAR
        )

        # get file
        response = requests.get(download_url)

        # store file
        if response.status_code == 200:
            filename = OUT / f"tl_{YEAR}_{fips}_sld{chamber}.zip"

            # This _could_ all be done with a single file operation,
            # by using a `BytesIO` file-like object to temporarily hold the
            # HTTP response. However, that's less readable and maintainable,
            # and a bit of delay isn't a problem given the slowness
            # of the Census downloads in the first place.
            with open(filename, "wb") as f:
                f.write(response.content)
            with zipfile.ZipFile(filename, "r") as f:
                f.extractall(OUT)
        else:
            response.raise_for_status()

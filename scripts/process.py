""" script to convert shp to geojson
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
step 1: load shp into geodataframe
step 2: add column for bounds
step 3: parse into json
step 4: add fields for chamber, district, state, ...
step 5: export as geojson

script 2/4

TODO: MD, NJ, NY, and WI house won't output for this script. figure out why. 
"""

# import libraries
import os
import sys
import json
import glob
import subprocess
import us
import geopandas as gpd
from pathlib import Path

IN = Path("data/geospatial/fetch")
OUT = Path("data/geospatial/process")

# import openstates_metadata as metadata


def shp_to_geojson(geojson_path, is_state_file):
    # read in the shp and store it in a geodataframe
    gdf = gpd.read_file(geojson_path)

    # add bounds
    # gdf['bounds'] = gdf.bounds.round(2).apply(lambda row: list(row), axis=1)

    # parse to geojson
    gdf_parsed = gdf.to_json()
    geojson = json.loads(gdf_parsed)

    # add fields to each feature -- geoid, bounds, state abbr, chamber, district
    for feature in geojson["features"]:
        # rename keys in state files
        if is_state_file:
            for key in [k for k in feature["properties"].keys()]:
                new_key = key.replace('10', '')
                feature["properties"][new_key] = feature["properties"].pop(key)

        state = us.states.lookup(feature["properties"]["STATEFP"])
        geoid = feature["properties"]["GEOID"]
        # bounds = feature["properties"]["bounds"]

        if is_state_file:
            name = state.name
            ccid = state.fips
        else:
            name = (
                us.states.lookup(feature["properties"]["STATEFP"]).name
                + ' '
                + feature["properties"]["NAMELSAD"]
            )

            # create new features
            ccid = (
                feature["properties"]["GEOID"] + "U"
                if feature["properties"]["LSAD"] == "LU"
                else feature["properties"]["GEOID"] + "L"
            )

            chamber = 'House' if feature["properties"]["LSAD"] == "LL" else 'Senate'

            district = (
                feature["properties"]["SLDLST"].lstrip('0')
                if "SLDLST" in feature["properties"].keys()
                else feature["properties"]["SLDUST"].lstrip('0')
            )

        feature["properties"] = {
            "state_fips": state.fips,
            "state_abbr": state.abbr,
            "geoid": geoid,
            "ccid": ccid,
            "name": name,
            # "bounds": bounds,
        }

        if not is_state_file:
            feature["properties"]["chamber"] = chamber
            feature["properties"]["district"] = district
        else:
            # if the shape is a state, and the shape is included in the final
            # shapefile, then we have no data on that state, and we want the
            # entire state to have a flag value for cc_score
            feature["properties"]["cc_score"] = 999

    # export to geojson file
    region_type = "state" if is_state_file else chamber.lower()
    output_path = OUT / f"{state.abbr}-{region_type}.geojson"
    print(f" {state.abbr}-{region_type} shp => {output_path.name}")

    # if the output directory doesn't exist, create it
    if not output_path.parent.exists():
        output_path.parent.mkdir(parents=True)

    with open(output_path, "w+") as geojson_file:
        json.dump(geojson, geojson_file)


if __name__ == "__main__":
    # check to see if all of the files were downloaded
    if len(sys.argv) == 1:
        files = sorted(IN.glob("tl*.shp"))
        if len(files) != 149:
            raise AssertionError(f"Expecting 149 shapefiles, got {len(files)}).")
    else:
        files = sys.argv[1:]

    # convert from shp to geojson
    for file in files:
        is_state_file = "state10" in file.name
        # create geojson in source folder
        newfilename = file.with_suffix(".geojson")
        if os.path.exists(newfilename):
            print(newfilename, "already exists, skipping")
        else:
            print(file, "=>", newfilename)
            subprocess.run(
                [
                    "ogr2ogr",
                    "-where",
                    f"GEOID{'10' if is_state_file else ''} NOT LIKE '%ZZZ'",
                    "-t_srs",
                    "crs:84",
                    "-f",
                    "GeoJSON",
                    newfilename,
                    file,
                ],
                check=True,
            )
        # create geojson in all folder
        shp_to_geojson(file, is_state_file)

    # finished message
    print("Done converting shp to geojson")

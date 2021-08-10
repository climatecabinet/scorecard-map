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
import geopandas as gpd
import os
import sys
import csv
import json
import glob
import subprocess
import us
import openstates_metadata as metadata

def shp_to_geojson(geojson_path):
    # read in the shp and store it in a geodataframe
    gdf = gpd.read_file(geojson_path)

    # add bounds
    gdf['bounds'] = gdf.bounds.round(2).apply(lambda row: list(row), axis = 1)

    # parse to geojson
    gdf_parsed = gdf.to_json()
    geojson = json.loads(gdf_parsed)

    # add fields to each feature -- geoid, bounds, state abbr, chamber, district
    for feature in geojson["features"]:
        # create new features
        ccid = feature["properties"]["GEOID"] + "U" if feature["properties"]["LSAD"] == "LU" else feature["properties"]["GEOID"] + "L"
        state_abbr = us.states.lookup(feature["properties"]["STATEFP"]).abbr
        name = us.states.lookup(feature["properties"]["STATEFP"]).name + ' ' + feature["properties"]["NAMELSAD"]
        chamber = 'House' if feature["properties"]["LSAD"] == "LL" else 'Senate'
        
        try:
            district = feature["properties"]["SLDLST"].lstrip('0')
        except KeyError:
            district = feature["properties"]["SLDUST"].lstrip('0')

        # rename features
        bounds = feature["properties"]["bounds"]
        geoid = feature["properties"]["GEOID"]
        state_fips = feature["properties"]["STATEFP"]


        feature["properties"] = {
            "state_fips": state_fips,
            "state_abbr": state_abbr,
            "geoid": geoid,
            "ccid": ccid,
            "name": name, 
            "chamber": chamber,
            "district": district, 
            "bounds": bounds
        }
        
    # export to geojson file
    output_filename = f"data/geospatial/all/{state_abbr}-{chamber}.geojson"
    print(f" {state_abbr}-{chamber} shp => {output_filename}")

    with open(output_filename, "w") as geojson_file:
        json.dump(geojson, geojson_file)

if __name__ == "__main__":
    # check to see if all of the files were downloaded
    if len(sys.argv) == 1:
        files = sorted(glob.glob("data/geospatial/source/tl*.shp"))
        if len(files) != 101: 
            raise AssertionError(f"Expecting 101 shapefiles, got {len(files)}).")
    else:
        files = sys.argv[1:]

    # convert from shp to geojson
    for file in files:
        # create geojson in source folder
        newfilename = file.replace(".shp", ".geojson")
        if os.path.exists(newfilename):
            print(newfilename, "already exists, skipping")
        else:
            print(file, "=>", newfilename)
            subprocess.run(
                [
                    "ogr2ogr",
                    "-where",
                    "GEOID NOT LIKE '%ZZZ'",
                    "-t_srs",
                    "crs:84",
                    "-f",
                    "GeoJSON",
                    newfilename,
                    file,
                ],
                check=True,
            )
        # create geojson in all foldr
        shp_to_geojson(file)

    # finished message
    print("Done converting shp to geojson")
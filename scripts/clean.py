"""script to clean state leg districts edges and reproject from Mercator to Albers
credit to @openstates/openstates-geo
credit to @developmentseed/dirty-reprojectors

process:
1. download national boundary data
2. using the boundary data, clean the edges of the state leg districts
3. TODO: reproject from Meractor and Albers
"""

# import libraries
import subprocess
import glob
import os

if __name__ == "__main__":
    print("Downloading national boundary")
    subprocess.run(
        "curl --silent --output data/geospatial/source/cb_2019_us_nation_5m.zip https://www2.census.gov/geo/tiger/GENZ2019/shp/cb_2019_us_nation_5m.zip".split()
    )
    subprocess.run(
        "unzip -q -o -d data/source data/geospatial/source/cb_2019_us_nation_5m.zip".split()
    )

    print("Clip GeoJSON to shoreline")
    filenames = []
    # for house files
    for filename in sorted(glob.glob("data/geospatial/all/*House.geojson")): 
        newfilename = filename.replace("/all/", "/state-leg/house/")
        filenames.append(newfilename)
        if os.path.exists(newfilename):
            print(f"{newfilename} exists, skipping")
        else:
            print(f"{filename} => {newfilename}")
            subprocess.run(
                [
                    "ogr2ogr",
                    "-clipsrc",
                    "data/geospatial/source/cb_2019_us_nation_5m.shp",
                    newfilename,
                    filename,
                ],
                check=True,
            )
    # for senate files
    for filename in sorted(glob.glob("data/geospatial/all/*Senate.geojson")): 
        newfilename = filename.replace("/all/", "/state-leg/senate/")
        filenames.append(newfilename)
        if os.path.exists(newfilename):
            print(f"{newfilename} exists, skipping")
        else:
            print(f"{filename} => {newfilename}")
            subprocess.run(
                [
                    "ogr2ogr",
                    "-clipsrc",
                    "data/geospatial/source/cb_2019_us_nation_5m.shp",
                    newfilename,
                    filename,
                ],
                check=True,
            )

    print("Done refining the geojson files. Look for them in the clean-data folder")
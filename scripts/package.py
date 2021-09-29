"""script that merges the clean shapefiles and gets them ready for upload.

script 5/5
"""

# import libraries
import shutil
import subprocess
import geojson
from pathlib import Path
from geojson import FeatureCollection
from geojson_rewind import rewind


if __name__ == "__main__":
    # create the necessary arcgis folders
    raw_dir = Path('data/geospatial/append')
    states_dir = Path('data/geospatial/clean/state')
    clean_dir = Path('data/geospatial/package')

    for out in [clean_dir / 'house', clean_dir / 'senate']:
        out.mkdir(parents=True, exist_ok=True)

    print("Copying chamber geojson files")
    # pull the appropriate chamber's geojson file from the appropriate directory
    for raw_shape in states_dir.glob('*.geojson'):
        for chamber in ['house', 'senate']:
            state_with_scores = (
                raw_dir / chamber / raw_shape.name.replace('state', chamber)
            )
            shape_to_use = (
                state_with_scores if state_with_scores.exists() else raw_shape
            )
            shutil.copy(shape_to_use, clean_dir / chamber / shape_to_use.name)

    # run geojson merge to merge everything in batches
    print('Merging geojsons into national shapefiles')
    # for each directory
    for chamber_dir in [clean_dir / 'house', clean_dir / 'senate']:
        print(f"Merging {chamber_dir.stem} shapes")

        all_chamber = FeatureCollection([])

        # unpack so states without scores are added first
        for state_path in sorted(chamber_dir.glob(f'*.geojson')):
            state_json = geojson.load(open(state_path, 'r'))
            all_chamber['features'].extend(state_json['features'])

        geojson.dump(
            all_chamber, open(clean_dir / f'all-{chamber_dir.stem}-raw.geojson', 'w')
        )

        print(f"Simplifying {chamber_dir.stem} geojson")
        subprocess.run(
            [
                "mapshaper "
                + str(clean_dir / f"all-{chamber_dir.stem}-raw.geojson")
                + " -simplify 20.1% "
                + f' -o {str(clean_dir / f"all-{chamber_dir.stem}-reduced.geojson")}'
            ],
            shell=True,
        )

        print(f"Rewinding {chamber_dir.stem} geojson")
        unwound = geojson.load(
            open(clean_dir / f'all-{chamber_dir.stem}-reduced.geojson', 'r')
        )
        geojson.dump(
            rewind(unwound),
            open(clean_dir / f'all-{chamber_dir.stem}-final.geojson', 'w'),
        )

        # unlink the intermediate files
        (clean_dir / f'all-{chamber_dir.stem}-raw.geojson').unlink()
        (clean_dir / f'all-{chamber_dir.stem}-reduced.geojson').unlink()

"""script to add cc score field to the state legislative district geojson files

process:
1. pull data from MongoDB
2. create tidy dataframe, that includes the cc score field
3. loop through the files in reprojected-state-leg and add the cc score field
4. store in dataframe
5. export dataframe as geojson for senate or house
6. QA/QC in Mapshaper 
7. Export as 1 file: geojson-merge house/*.geojson > all-house.geojson or geojson-merge senate/*.geojson > all-senate.geojson
8. QA/QC in Mapshaper (and reduce file size if needed)

script 4/4
"""

# import libraries
import pymongo
import urllib
import pandas as pd
import geopandas as gpd
from pathlib import Path

# TEMP(matt): for the time being, we want to remove NC and IA from our launch states
SKIP_STATES = ['NC', 'IA']


def append_scores_for_chamber(legi_df, raw_dir, cleaned_dir):
    for raw_shape in sorted(raw_dir.glob("*.geojson")):
        # store the file in a gdf
        raw_gdf = gpd.read_file(raw_shape)
        # if there's a ccid field, append the score
        if 'ccid' not in raw_gdf.columns:
            print('theres no ccid field. pass.')
            continue

        clean_gdf = raw_gdf.merge(legi_df[['ccid', 'cc_score']], on='ccid')

        # if there are no scores for this state, continue
        state_abbr = raw_shape.stem.split('-')[0]

        if not len(clean_gdf) or state_abbr in SKIP_STATES:
            print(
                f'Skipping {raw_shape.name}, no cc scores to include (or a skip state).'
            )
            continue

        # QA/QC check
        print(f'Appended {raw_shape} is {len(clean_gdf)} vs. {len(raw_gdf)}')

        clean_gdf.to_file(cleaned_dir / raw_shape.name, driver='GeoJSON')


if __name__ == "__main__":
    """pull data from MongoDB"""
    print('connect to the production database')
    # read in regions data from mongodb
    username = urllib.parse.quote_plus('browse-data')
    password = urllib.parse.quote_plus('climate-cabinet-1963')
    client = pymongo.MongoClient(
        f'mongodb+srv://{urllib.parse.quote_plus("browse-data")}:'
        f'{urllib.parse.quote_plus("climate-cabinet-1963")}'
        '@cluster1.kmeus.mongodb.net/'
    )
    db = client['production-8-19-2021']
    df = pd.DataFrame(list(db.region.find()))
    df1 = pd.DataFrame(list(db.representative.find()))
    client.close()

    """ create tidy dataframe """
    print('creating tidy dataframe')
    # expanded incumbents
    df_incumbents = pd.concat(
        [
            df.drop(['incumbents'], axis=1),
            df['incumbents'].apply(pd.Series)[0].apply(pd.Series)[['name', 'rep']],
            df['incumbents'].apply(pd.Series)[1].apply(pd.Series)[['name', 'rep']],
        ],
        axis=1,
    )

    # filtered dataframe to just show necessary columns for state house & senate
    regions = df_incumbents[
        (df_incumbents['_cls'] == 'Region.District.StateLegDistLower')
        | (df_incumbents['_cls'] == 'Region.District.StateLegDistUpper')
    ][['state_abbr', 'geoid', 'ccid', 'district_type', 'name', 'rep']]

    # rename columns
    regions.columns = [
        'state_abbr',
        'geoid',
        'ccid',
        'chamber',
        'district_name',
        'incumbent_name_1',
        'incumbent_name_2',
        'district_1',
        'district_2',
    ]

    # grab only necessary columns for future merging
    regions = regions[['state_abbr', 'geoid', 'ccid', 'district_name']]

    # filtered representative dataframe
    rep_df = pd.concat(
        [df1.drop(['office'], axis=1), df1['office'].apply(pd.Series)], axis=1
    )[
        [
            'full_name',
            'cc_score',
            'district_ccid',
            'district',
            'seat_number',
            'party',
            'is_current',
        ]
    ]

    # get average score (for current legislators)
    representative = (
        rep_df.query("is_current == True")
        .groupby('district_ccid')
        .mean()
        .reset_index(drop=False)[['district_ccid', 'cc_score']]
    )

    # fill NaN with 999 for cc score
    representative['cc_score'] = representative['cc_score'].fillna('999')

    # round score to integer
    representative['cc_score'] = representative['cc_score'].astype(int)

    # merge the two dataframes
    ccscorecard_legislator = regions.merge(
        representative, left_on='ccid', right_on='district_ccid', how='inner'
    ).drop(columns=['district_ccid'])

    # manual edits -- append districts with vacant seats

    # set PA House District 113 cc score as SEAT VACANT (444)
    # special election is nov 2021
    ccscorecard_legislator.loc[len(ccscorecard_legislator.index)] = [
        'PA',
        '42113',
        '42113L',
        'State House District 113',
        444,
    ]

    # tidy dataframe
    ccscorecard_legislator = ccscorecard_legislator.sort_values(
        by=['geoid', 'cc_score'], ascending=True
    )

    """ loop through files and add the cc score """
    print('Adding CC Scores to shapes')
    raw_dir = Path("data/geospatial/clean")
    cleaned_dir = Path("data/geospatial/append")

    # if the output directories don't exist, create them
    for output in [cleaned_dir / "house", cleaned_dir / "senate"]:
        output.mkdir(parents=True, exist_ok=True)

    # handle for house
    append_scores_for_chamber(
        ccscorecard_legislator, raw_dir / 'house', cleaned_dir / 'house'
    )
    append_scores_for_chamber(
        ccscorecard_legislator, raw_dir / 'senate', cleaned_dir / 'senate'
    )

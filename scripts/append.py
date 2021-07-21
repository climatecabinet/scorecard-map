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
"""

# import libraries
import pymongo
import urllib
import pandas as pd
import geopandas as gpd
import glob

if __name__ == "__main__":
    """ pull data from MongoDB """
    print('pulling data from MongoDB')
    # read in regions data from mongodb
    username = urllib.parse.quote_plus('browse-data')
    password = urllib.parse.quote_plus('climate-cabinet-1963')
    client = pymongo.MongoClient(f'mongodb+srv://{username}:{password}@cluster1.kmeus.mongodb.net/test?retryWrites=true&w=majority')
    db = client['ccscorecard-experimental']
    collection = db.region
    df = pd.DataFrame(list(collection.find()))
    client.close()

    # read in representative data
    username = urllib.parse.quote_plus('browse-data')
    password = urllib.parse.quote_plus('climate-cabinet-1963')
    client = pymongo.MongoClient(f'mongodb+srv://{username}:{password}@cluster1.kmeus.mongodb.net/test?retryWrites=true&w=majority')
    db = client['ccscorecard-experimental']
    collection = db.representative
    df1 = pd.DataFrame(list(collection.find()))
    client.close()

    """ create tidy dataframe """
    print('creating tidy dataframe')
    # expanded incumbents
    df_incumbents = pd.concat([df.drop(['incumbents'], axis=1), df['incumbents'].apply(pd.Series)[0].apply(pd.Series)[['name', 'rep']]], axis=1)

    # expanded 2016 presidential results
    df_presidential = pd.concat([df_incumbents.drop(['presidential_elections'], axis=1), df_incumbents['presidential_elections'].apply(pd.Series)[0].apply(pd.Series)[['dem_share', 'year']]], axis=1)

    # filtered dataframe to just show necessary columns for state house & senate
    regions = df_presidential[(df_presidential['district_type'] == 'State House') | (df_presidential['district_type'] == 'State Senate')][['state_abbr', 'geoid', 'ccid', 'district_type', 'name', 'rep', 'dem_share', 'year']]

    # rename columns
    regions.columns = ['state_abbr', 'geoid', 'ccid', 'chamber', 'district_name', 'name', 'district', 'dem_share', 'year']

    # remove 'State' from chamber. show just 'Senate' or 'House'
    regions['chamber'] = regions['chamber'].str.split('State ').str[1]

    # convert dem_share to percentage
    regions['dem_share'] = (100*regions['dem_share']).round(1)

    # filtered representative dataframe
    representative = pd.concat([df1.drop(['office'], axis=1), df1['office'].apply(pd.Series)], axis=1)[['full_name', 'cc_score', 'district_ccid', 'district', 'seat_number', 'party', 'is_current']]

    # fill NAN with 0 for CCscore
    representative['cc_score'] = representative['cc_score'].fillna('0')

    # round score to integer
    representative['cc_score'] = representative['cc_score'].astype(int)

    # merge the two dataframes
    ccscorecard_legislator = regions.merge(representative, left_on='ccid', right_on='district_ccid', how='inner').drop(columns=['district_x', 'district_y', 'district_ccid', 'full_name'])

    # only show current legislators
    ccscorecard_legislator = ccscorecard_legislator[ccscorecard_legislator['is_current'] == True]

    # fill NaN with NA
    ccscorecard_legislator['dem_share'] = ccscorecard_legislator['dem_share'].fillna("NA")
    ccscorecard_legislator['year'] = ccscorecard_legislator['year'].fillna("NA")

    # tidy dataframe
    ccscorecard_legislator = ccscorecard_legislator.sort_values(by=['geoid', 'cc_score'], ascending=True).drop_duplicates(subset='name',keep='last')

    """ loop through files and add the cc score """
    print('looping thru files to add the cc score')
    print('house files...')
    # loop through files in reprojected-state-leg/house
    for filename in sorted(glob.glob("data/geospatial/reprojected-state-leg/house/*House.geojson")):
        if filename in ['data/geospatial/reprojected-state-leg/house/AZ-House.geojson', 'data/geospatial/reprojected-state-leg/house/CO-House.geojson',
        'data/geospatial/reprojected-state-leg/house/CT-House.geojson', 'data/geospatial/reprojected-state-leg/house/FL-House.geojson', 'data/geospatial/reprojected-state-leg/house/GA-House.geojson',
        'data/geospatial/reprojected-state-leg/house/IL-House.geojson', 'data/geospatial/reprojected-state-leg/house/IA-House.geojson', 'data/geospatial/reprojected-state-leg/house/KS-House.geojson',
        'data/geospatial/reprojected-state-leg/house/ME-House.geojson', 'data/geospatial/reprojected-state-leg/house/MD-House.geojson', 'data/geospatial/reprojected-state-leg/house/MI-House.geojson',
        'data/geospatial/reprojected-state-leg/house/MN-House.geojson', 'data/geospatial/reprojected-state-leg/house/MO-House.geojson', 'data/geospatial/reprojected-state-leg/house/MT-House.geojson',
        'data/geospatial/reprojected-state-leg/house/NE-House.geojson', 'data/geospatial/reprojected-state-leg/house/NJ-House.geojson', 'data/geospatial/reprojected-state-leg/house/NM-House.geojson',
        'data/geospatial/reprojected-state-leg/house/NY-House.geojson', 'data/geospatial/reprojected-state-leg/house/NC-House.geojson', 'data/geospatial/reprojected-state-leg/house/OH-House.geojson',
        'data/geospatial/reprojected-state-leg/house/OR-House.geojson', 'data/geospatial/reprojected-state-leg/house/PA-House.geojson', 'data/geospatial/reprojected-state-leg/house/SC-House.geojson',
        'data/geospatial/reprojected-state-leg/house/TN-House.geojson', 'data/geospatial/reprojected-state-leg/house/TX-House.geojson', 'data/geospatial/reprojected-state-leg/house/UT-House.geojson',
        'data/geospatial/reprojected-state-leg/house/VA-House.geojson', 'data/geospatial/reprojected-state-leg/house/WA-House.geojson', 'data/geospatial/reprojected-state-leg/house/WV-House.geojson',
        'data/geospatial/reprojected-state-leg/house/WI-House.geojson']:
            # store the file in a gdf
            gdf = gpd.read_file(filename)
            # add the cc score
            # if there's a ccid field, append the score
            if 'ccid' in gdf.columns:
                appended_gdf = gdf.merge(ccscorecard_legislator[['ccid', 'cc_score']], on = 'ccid')
                # QA/QC check
                print('Appended {filename} is {length1} vs. {length2}'.format(filename=filename, length1=len(appended_gdf), length2=len(gdf)))
                if len(appended_gdf) == 0:
                    print('the geodataframe is empty. check')
                else:
                    # save as geojson
                    newfilename = filename.replace("/reprojected-state-leg/", "/appended-state-leg/")
                    appended_gdf.to_file(newfilename, driver='GeoJSON')
            else:
                print('theres no ccid field. pass.')
        else:
            print('Not a priority state. Pass.')

    print('senate files...')
    # loop through files in reprojected-state-leg/senate
    for filename in sorted(glob.glob("data/geospatial/reprojected-state-leg/senate/*Senate.geojson")):
        if filename in ['data/geospatial/reprojected-state-leg/senate/AZ-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/CO-Senate.geojson',
        'data/geospatial/reprojected-state-leg/senate/CT-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/FL-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/GA-Senate.geojson',
        'data/geospatial/reprojected-state-leg/senate/IL-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/IA-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/KS-Senate.geojson',
        'data/geospatial/reprojected-state-leg/senate/ME-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/MD-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/MI-Senate.geojson',
        'data/geospatial/reprojected-state-leg/senate/MN-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/MO-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/MT-Senate.geojson',
        'data/geospatial/reprojected-state-leg/senate/NE-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/NJ-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/NM-Senate.geojson',
        'data/geospatial/reprojected-state-leg/senate/NY-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/NC-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/OH-Senate.geojson',
        'data/geospatial/reprojected-state-leg/senate/OR-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/PA-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/SC-Senate.geojson',
        'data/geospatial/reprojected-state-leg/senate/TN-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/TX-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/UT-Senate.geojson',
        'data/geospatial/reprojected-state-leg/senate/VA-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/WA-Senate.geojson', 'data/geospatial/reprojected-state-leg/senate/WV-Senate.geojson',
        'data/geospatial/reprojected-state-leg/senate/WI-Senate.geojson']:
            # store the file in a gdf
            gdf = gpd.read_file(filename)
            # add the cc score
            # if there's a ccid field, append the score
            if 'ccid' in gdf.columns:
                appended_gdf = gdf.merge(ccscorecard_legislator[['ccid', 'cc_score']], on = 'ccid')
                # QA/QC check
                print('Appended {filename} is {length1} vs. {length2}'.format(filename=filename, length1=len(appended_gdf), length2=len(gdf)))
                if len(appended_gdf) == 0:
                    print('the geodataframe is empty. check')
                else:
                    # save as geojson
                    newfilename = filename.replace("/reprojected-state-leg/", "/appended-state-leg/")
                    appended_gdf.to_file(newfilename, driver='GeoJSON')
            else:
                print('theres no ccid field. pass.')
        else:
            print('Not a priority state. Pass.')
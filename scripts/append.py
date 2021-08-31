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

# TODO: WA representatives.district_ccid not matching with regions.ccid

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
    db = client['production-8-19-2021']
    collection = db.region
    df = pd.DataFrame(list(collection.find()))
    client.close()

    # read in representative data
    username = urllib.parse.quote_plus('browse-data')
    password = urllib.parse.quote_plus('climate-cabinet-1963')
    client = pymongo.MongoClient(f'mongodb+srv://{username}:{password}@cluster1.kmeus.mongodb.net/test?retryWrites=true&w=majority')
    db = client['production-8-19-2021']
    collection = db.representative
    df1 = pd.DataFrame(list(collection.find()))
    client.close()

    """ create tidy dataframe """
    print('creating tidy dataframe')
    # expanded incumbents
    df_incumbents = pd.concat([df.drop(['incumbents'], axis=1), df['incumbents'].apply(pd.Series)[0].apply(pd.Series)[['name', 'rep']], df['incumbents'].apply(pd.Series)[1].apply(pd.Series)[['name', 'rep']]], axis=1)

    # filtered dataframe to just show necessary columns for state house & senate
    regions = df_incumbents[(df_incumbents['_cls'] == 'Region.District.StateLegDistLower') | (df_incumbents['_cls'] == 'Region.District.StateLegDistUpper')][['state_abbr', 'geoid', 'ccid', 'district_type', 'name', 'rep']]

    # rename columns
    regions.columns = ['state_abbr', 'geoid', 'ccid', 'chamber', 'district_name', 'incumbent_name_1', 'incumbent_name_2', 'district_1', 'district_2']

    # remove 'State' from chamber. show just 'Senate' or 'House'
    # regions['chamber'] = regions['chamber'].str.split('State ').str[1]

    # grab only necessary columns for future merging
    regions = regions[['state_abbr', 'geoid', 'ccid', 'district_name']]

    # filtered representative dataframe
    rep_df = pd.concat([df1.drop(['office'], axis=1), df1['office'].apply(pd.Series)], axis=1)[['full_name', 'cc_score', 'district_ccid', 'district', 'seat_number', 'party', 'is_current']]

    # manual data edits from 8/27/21 QA/QC -- change 'is_current' from false to true

    # change 'is_current' from false to true for MN House District 50B
    rep_df.loc[3917, 'is_current'] = True

    # change 'is_current' from false to true for MN House District 32A
    rep_df.loc[4598, 'is_current'] = True

    # change 'is_current' from false to true for MO House District 34
    rep_df.loc[4145, 'is_current'] = True

    # change 'is_current' from false to true for MO House District 34
    rep_df.loc[4536, 'is_current'] = True

    # set NC House District 44 is_current from false to true
    rep_df.loc[6270, 'is_current'] = True

    # set WV House District 30 is_current from false to true
    rep_df.loc[9834, 'is_current'] = True

    # set WV House District 26 is_current from false to true
    rep_df.loc[9838, 'is_current'] = True

    # set WV House District 39 is_current from false to true
    rep_df.loc[9835, 'is_current'] = True

    # set WV House District 45 is_current from false to true
    rep_df.loc[9843, 'is_current'] = True

    # set WV House District 65 is_current from false to true
    rep_df.loc[9841, 'is_current'] = True

    # set WI House District 60 is_current from false to true
    rep_df.loc[10169, 'is_current'] = True

    # set MI House District 8 is_current from false to true
    rep_df.loc[3642, 'is_current'] = True

    # set MI House District 28 is_current from false to true
    rep_df.loc[3634, 'is_current'] = True

    # get average score (for current legislators)
    representative = rep_df.query("is_current == True").groupby('district_ccid').mean().reset_index(drop=False)[['district_ccid', 'cc_score']]

    # fill NaN with 999 for cc score
    representative['cc_score'] = representative['cc_score'].fillna('999')

    # round score to integer
    representative['cc_score'] = representative['cc_score'].astype(int)

    # merge the two dataframes
    ccscorecard_legislator = regions.merge(representative, left_on='ccid', right_on='district_ccid', how='inner').drop(columns=['district_ccid'])

    # manual edits -- append districts with vacant seats

    # set PA House District 113 cc score as SEAT VACANT (444)
    # special election is nov 2021 
    ccscorecard_legislator.loc[len(ccscorecard_legislator.index)] = ['PA', '42113', '42113L', 'State House District 113', 444] 

    # set WI House District 37 legislator cc score as SEAT VACANT (444)
    # seat is not actually vacant. the incumbent is william penterman. in office july 26, 2021
    # setting as vacant for now, until changes are reflected in MongoDB
    ccscorecard_legislator.loc[len(ccscorecard_legislator.index)] = ['WI', '55037', '55037L', 'Assembly District 37', 444] 

    # tidy dataframe
    ccscorecard_legislator = ccscorecard_legislator.sort_values(by=['geoid', 'cc_score'], ascending=True)

    """ loop through files and add the cc score """
    print('looping thru files to add the cc score')
    print('house files...')
    for filename in sorted(glob.glob("data/geospatial/final/house/*House.geojson")):
    # store the file in a gdf
        gdf = gpd.read_file(filename)
        # if there's a ccid field, append the score
        if 'ccid' in gdf.columns:
            appended_gdf = gdf.merge(ccscorecard_legislator[['ccid', 'cc_score']], on = 'ccid')
            # QA/QC check
            print('Appended {filename} is {length1} vs. {length2}'.format(filename=filename, length1=len(appended_gdf), length2=len(gdf)))
            if len(appended_gdf) == 0:
                print('the geodataframe is empty. check')
            else:
                # save as geojson
                newfilename = filename.replace("/final/", "/appended-state-leg/")
                appended_gdf.to_file(newfilename, driver='GeoJSON')
        else:
            print('theres no ccid field. pass.')

    # print('senate files...')
    # # loop through files in reprojected-state-leg/senate
    for filename in sorted(glob.glob("data/geospatial/final/senate/*Senate.geojson")):
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
                newfilename = filename.replace("/final/", "/appended-state-leg/")
                appended_gdf.to_file(newfilename, driver='GeoJSON')
        else:
            print('theres no ccid field. pass.')
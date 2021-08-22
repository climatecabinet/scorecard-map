import * as Realm from 'realm-web';
import { REALM_APP_ID } from './constants';

const app = new Realm.App(REALM_APP_ID);

async function loginAnonymous() {
    const credentials = Realm.Credentials.anonymous()
    try {
      const user = await app.logIn(credentials);
      return user
    } catch(err) {
      console.error("Failed to log in", err);
    }
  }

async function getValidAccessToken() {
  // Guarantee that there's a logged in user with a valid access token
  if (!app.currentUser) {
    // If no user is logged in, log in an anonymous user. The logged in user will have a valid
    // access token.
    const user = await loginAnonymous();
    console.log('Successfully logged in!', user);
  } else {
    // An already logged in user's access token might be stale. To guarantee that the token is
    // valid, we refresh the user's custom data which also refreshes their access token.
    await app.currentUser.refreshCustomData();
  }

  return app.currentUser.accessToken;
}

export const fetchWithAccessToken = async (uri, options) => {
  const accessToken = await getValidAccessToken();
  options.headers.Authorization = `Bearer ${accessToken}`;
  return fetch(uri, options);
};

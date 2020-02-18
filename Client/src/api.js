// Orderly interface to the REST server, providing:
// 1. Standard URL base
// 2. Standard headers to manage CORS and content type
// 3. Guarantee that 4xx and 5xx results are returned as
//    rejected promises, with a payload comprising an
//    array of user-readable strings describing the error.
// 4. All successful post operations return promises that
//    resolve to a JS object representing the newly added
//    entity (all fields, not just those in the post body)
// 5. Signin and signout operations that retain relevant
//    cookie data.  Successful signin returns promise 
//    resolving to newly signed in user.

const baseURL = "http://34.219.177.74/api/"; //"http://localhost:3001/";
const headers = new Headers();
var cookie;

headers.set('Content-Type', 'application/JSON');

const reqConf = {
   headers: headers,
   credentials: 'include',
};

// Helper functions for the comon request types, automatically
// adding verb, headers, and error management.
export function post(endpoint, body) {
   console.log(body);
   return fetch(baseURL + endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...reqConf
   });
}

export function put(endpoint, body) {
   return fetch(baseURL + endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...reqConf
   });
}

export function get(endpoint) {
   return fetch(baseURL + endpoint, {
      method: 'GET',
      ...reqConf
   });
}

export function del(endpoint) {
   return fetch(baseURL + endpoint, {
      method: 'DELETE',
      ...reqConf
   });
}

function handleErrors(response) {
   if (response.status === 500)
      throw "Server Connect Error";
   else if (response.status === 400)
      return response.json()
         .then(err => {throw errorTranslate(err[0].tag, 'en')}); 
   else if (response.status == 401)
      throw "Unauthorized";
   else if (response.status == 403)
      throw "Forbidden";
   return response;
}

// Functions for performing the api requests

/**
 * Sign a user into the service, returning a promise of the 
 * user data
 * @param {{email: string, password: string}} cred
 */
export function signIn(cred) {
   return post("Ssns", cred)
      .catch(err => Promise.reject("Server Connect Error"))
      .then(handleErrors)
      .then((response) => {
         let location = response.headers.get("Location").split('/');
         cookie = location[location.length - 1];
         return get("Ssns/" + cookie)
      })
      .then(response => response.json())   // ..json() returns a Promise!
      .then(rsp => get('Prss/' + rsp.prsId))
      .then(userResponse => userResponse.json())
      .then(rsp => rsp[0])
}

/**
 * @returns {Promise} result of the sign out request
 */
export function signOut() {
   return del("Ssns/" + cookie)
      .catch(err => Promise.reject("Server Connect Error"))
      .then(handleErrors);
}

/**
 * Register a user
 * @param {Object} user
 * @returns {Promise resolving to new user}
 */
export function postPrs(user) {
   return post("Prss", user)
      .catch(err => Promise.reject("Server Connect Error"))
      .then(handleErrors)
  
   //.catch((error) => {console.log(error)});
      //return get("Prss/" + location[location.length - 1]);
   //.then(rsp => rsp.json());
   //[0]);
}

/**
 * @returns {Promise} json parsed data
 */
export function putQuery(queryId, body){
   return put(`Query/${queryId}`, body)
      .catch(err => Promise.reject("Server Connect Error"))
      .then(handleErrors)
      .then(rsp => {
         return get(`Query/${queryId}`);
      })
      .then(rsp => rsp.json());
}

export function getQueries(name, course, project, professor, resolved, pos) {
   return get("Query?" + (name ? "name=" + name + "&" : "")
   + (course ? "course=" + course + "&" : "") 
   + (project ? "project=" + project + "&" : "") 
   + (professor ? "professor=" + professor + "&" : "") 
   + (pos ? "pos=" + pos + "&" : "") 
   + (resolved ? "resolved=" + resolved : ""))
   .catch(err => Promise.reject("Server Connect Error"))
   .then(handleErrors)
   .then((res) => res.json());
}

export function postQuery(body) {
   return post("Query", body)
     .catch(err => Promise.reject("Server Connect Error"))
     .then(handleErrors)
     .then(rsp => {
        let location = rsp.headers.get("Location").split('/');
        return get(`Query/${location[location.length-1]}`);
     })
     .then(rsp => rsp.json());
}

export function delQuery(queryId){
   return del("Query/" + queryId)
      .catch(err => Promise.reject("Server Connect Error"))
      .then(handleErrors);
}

const errMap = {
   en: {
      missingField: 'Field missing from request: ',
      badValue: 'Field has bad value: ',
      notFound: 'Entity not present in DB',
      badLogin: 'Email/password combination invalid',
      dupEmail: 'Email duplicates an existing email',
      noTerms: 'Acceptance of terms is required',
      forbiddenRole: 'Role specified is not permitted.',
      noOldPwd: 'Change of password requires an old password',
      oldPwdMismatch: 'Old password that was provided is incorrect.',
      dupTitle: 'Conversation title duplicates an existing one',
      dupEnrollment: 'Duplicate enrollment',
      forbiddenField: 'Field in body not allowed.',
      queryFailed: 'Query failed (server problem).'
   },
   es: {
      missingField: '[ES] Field missing from request: ',
      badValue: '[ES] Field has bad value: ',
      notFound: '[ES] Entity not present in DB',
      badLogin: '[ES] Email/password combination invalid',
      dupEmail: '[ES] Email duplicates an existing email',
      noTerms: '[ES] Acceptance of terms is required',
      forbiddenRole: '[ES] Role specified is not permitted.',
      noOldPwd: '[ES] Change of password requires an old password',
      oldPwdMismatch: '[ES] Old password that was provided is incorrect.',
      dupTitle: '[ES] Conversation title duplicates an existing one',
      dupEnrollment: '[ES] Duplicate enrollment',
      forbiddenField: '[ES] Field in body not allowed.',
      queryFailed: '[ES] Query failed (server problem).'
   },
   swe: {
      missingField: 'Ett fält saknas: ',
      badValue: 'Fält har dåligt värde: ',
      notFound: 'Entitet saknas i DB',
      badLogin: 'Email/lösenord kombination ogilltig',
      dupEmail: 'Email duplicerar en existerande email',
      noTerms: 'Villkoren måste accepteras',
      forbiddenRole: 'Angiven roll förjuden',
      noOldPwd: 'Tidiagre lösenord krav för att updatera lösenordet',
      oldPwdMismatch: 'Tidigare lösenord felaktigt',
      dupTitle: 'Konversationstitel duplicerar tidigare existerande titel',
      dupEnrollment: 'Duplicerad inskrivning',
      forbiddenField: 'Förbjudet fält i meddelandekroppen',
      queryFailed: 'Förfrågan misslyckades (server problem).'
   }
}

/**
 * @param {string} errTag
 * @param {string} lang
 */
export function errorTranslate(errTag, lang = 'en') {
   return errMap[lang][errTag] ||  'Unknown Error!';
}

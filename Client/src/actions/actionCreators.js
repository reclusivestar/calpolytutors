import * as api from '../api';

export function signIn(credentials, cb) {
   return (dispatch, prevState) => {
      api.signIn(credentials)
      .then((userInfo) => dispatch({type: "SIGN_IN", user: userInfo}))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch({type: 'LOGIN_ERR', details: error}))
   };
}

export function clearError(){
   return (dispatch, prevState) => {
      dispatch({type: 'CLEAR'});
   };
}

export function signOut(cb) {
   return (dispatch, prevState) => {
      api.signOut()
      .then(() => dispatch({ type: 'SIGN_OUT' }))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch({type: 'LOGOUT_ERR', details: error}));
   };
}

export function register(data, cb) {
   return (dispatch, prevState) => {
      api.postPrs(data)
      .then(() => {if (cb) cb();})
      .catch(error => dispatch({type: 'REGISTER_ERR', details: error}));
   };
}

export function updateQueries(name, course, project, professor, resolved, pos, cb){
   return (dispatch, prevState) => {
      api.getQueries(name, course, project, professor, resolved, pos)
      .then((queries) => dispatch({ type: 'UPDATE_QUERIES', queries}))
      .then(() => {if (cb) cb();})
   }
}

export function addQuery(body, cb){
   return (dispatch, prevState) => {
      api.postQuery(body)
      .then((query) => dispatch({type: 'ADD_QUERY', query}))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch({type: 'ADD_QUERY_ERR', details: error}));
   }
}

export function modQuery(queryId, body, cb) {
   return (dispatch, prevState) => {
      api.putQuery(queryId, body)
      .then((queries) => dispatch({type: 'MOD_QUERY', data: {queries: queries, id: queryId}}))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch({type: 'QUERY_MOD_ERR', details: error}));
   };
}

export function delQuery(queryId, cb){
   return (dispatch, prevState) => {
      api.delQuery(queryId)
      .then(dispatch({type: 'DEL_QUERY', id: queryId}))
      .then(() => {if (cb) cb();})
      .catch(error => dispatch({type: 'DEL_QUERY_ERROR', details: error}));
   }
}
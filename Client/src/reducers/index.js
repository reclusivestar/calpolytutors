import { combineReducers } from 'redux';

import Prss from './Prss';
import Errs from './Errs';
import Query from './Query';

const rootReducer = combineReducers({Prss, Errs, Query});
export default rootReducer;



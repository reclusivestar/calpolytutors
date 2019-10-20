function Erss(state = {}, action) {
   console.log("Errs reducing action " + action.type);
   switch(action.type) {
   case 'REGISTER_ERR':
      return action.details.toString();
   case 'LOGIN_ERR':
      return action.details.toString();
   case 'LOGOUT_ERR' :
      return action.details.toString();
   case 'QUERY_MOD_ERR':
      return action.details.toString();
   case 'CLEAR':
      return {};
   default:
      return state;
   }
}

export default Erss;

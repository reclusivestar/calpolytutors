export default function Query(state = [], action) {
   console.log("Query reducing action " + action.type);
   switch (action.type) {
      case 'UPDATE_QUERIES':
         return action.queries;
      case 'MOD_QUERY':
         console.log(action);
         return state.map(val => val.id !== action.data.id ?
            val : Object.assign({}, val, { summary: action.data.queries.summary, 
            class: action.data.queries.class, project: action.data.queries.project,
            professor: action.data.queries.professor, resolved: action.data.queries.resolved}));
      case 'ADD_QUERY': 
         console.log(action);
         return state.concat([action.query]);
      case 'DEL_QUERY':
         return state.filter(query => query.id !== action.id);
      default:
         return state;
   }
}

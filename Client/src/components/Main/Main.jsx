import React, { Component } from 'react';
import { Register, SignIn, ErrorDialog } from '../index';
import { Route, Redirect, Switch } from 'react-router-dom';
import './Main.css';
import Query from '../Query/Query';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

var ProtectedRoute = ({component: Cmp, path, ...rest }) => {
   // console.log("HELLOOOOO" + JSON.stringify(rest));
   return (<Route path={path} render={(props) => {
      return Object.keys(rest.Prss).length !== 0 ?
      <Cmp {...rest}/> : <Redirect to='/signin'/>;}}/>);
   };
   
class Main extends Component {
   constructor(props) {
      super(props);
      this.state = {
         showError: false
      }
   }

   signedIn() {
      return Object.keys(this.props.Prss).length !== 0; // Nonempty Prss obj
   }

   // Function component to generate a Route tag with a render method 
   // conditional on login.  Params {conditional: Cmp to render if signed in}

   render() {
      console.log("Redrawing main");
      return (
      <div >
         <div>
         <AppBar position="static">
            <Toolbar>
            {this.signedIn() ? 
             <Typography variant="h6" color="inherit" >
             {`Logged in as: ${this.props.Prss.firstName}
                             ${this.props.Prss.lastName}`}
             </Typography>
            : ''}
            {this.signedIn() ?
             <Button key={0} color="inherit"
             onClick= {() => this.props.history.push("/queries")}>Questions</Button>
             :
             [
               <Button key={0} color="inherit"
               onClick= {() => this.props.history.push("/signin")}>Sign in</Button>,
               <Button key={1} color="inherit"
               onClick= {() => this.props.history.push("/register")}>Register</Button>
             ]
            }
            {this.signedIn() ?
            <Button color="inherit" 
            onClick={() => this.props.signOut(() => this.props.history.push("/signin"))}>Log out
            </Button>
            : ''
            }
            </Toolbar>
         </AppBar>
         </div>         
            <Switch>
               <Route exact path='/'
                  component={() => this.props.Prss ? 
                   <Redirect to="/queries" /> : <Redirect to="/signin" />} />
               <Route path='/signin' 
                render={() => <SignIn {...this.props} />} />
               <Route path='/register'
                render={() => <Register {...this.props} />} />
                <ProtectedRoute path='/queries' component={Query}
                {...this.props}/>
            </Switch>
 
            <ErrorDialog
               show={this.props.Errs.length ? true : false}
               title="Error Notice"
               body={this.props.Errs.toString()}
               buttons={['OK']}
               onClose={() => {
                 this.props.clearError();
               }}
            />
         </div>
      )
   }
}

export default Main

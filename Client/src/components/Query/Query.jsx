import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Col, Row, Button, Glyphicon} 
   from 'react-bootstrap';
import QueryModal from './QueryModal';
import { ConfDialog } from '../index';

export default class Query extends Component {
   constructor(props){
      super(props);
      this.props.updateQueries(); //updateQueries(name, course, project, professor, resolved, cb)
      this.state = {
         showModal: false,
         showConfirmation: false,
         delQuery: null,
         editQuery: null,
      }
   }

   /*componentDidMount() {
      this.interval = setInterval(() => this.props.updateQueries(), 10000);
   }
   componentWillUnmount() {
      clearInterval(this.interval);
   }*/

   openModal = (query) => {
      const newState = { showModal: true };

      if (query)
         newState.editQuery = query;
      this.setState(newState);
   }

   resolve = (query) => {
      var result = {};
      result.class = query.class;
      result.professor = query.professor;
      result.project = query.project;
      result.summary = query.summary;
      result.resolved = 1;
      this.props.modQuery(query.id, result);
      this.props.updateQueries();
   }

   modalDismiss = (result) => {
      if (result.status === "Ok") {
         console.log(result);
         if (this.state.editQuery)
            this.modQuery(result.body);
         else
            this.newQuery(result.body);
         this.props.clearError();
      }
     // this.props.updateQueries();
      this.setState({ showModal: false, editQuery: null });
   }

   modQuery(result) {
      console.log(result);
      this.props.modQuery(this.state.editQuery.id, result);
   }

   newQuery(result) {
      this.props.addQuery(result);
   }

   openConfirmation = (query) => {
      this.setState({ delQuery: query, showConfirmation: true })
   }

   closeConfirmation = (res) => {
      if (res === 'Yes') {
         this.props.delQuery(this.state.delQuery.id);
      }
      this.setState({ delQuery: null, showConfirmation: false });
   }

   render() {
      var queryItems = [];
      this.props.Query.forEach(query => {
         queryItems.push(<QueryItem
               key={query.id}
               id ={query.id}
               firstName = {query.firstName}
               lastName = {query.lastName}
               class = {query.class}
               project = {query.project}
               professor = {query.professor}
               content ={query.summary}
               whenMade={query.whenMade}
               email={query.email}
               pos={query.pos}
               onDelete={() => this.openConfirmation(query)}
               onEdit={() => this.openModal(query)}
               onMark={() => this.resolve(query)}/>);
      });
      return (
         <section className="container">
            <h1>Questions</h1>
            <Button onClick={() => this.openModal()}>
               Post Question
            </Button>
            <ListGroup>
               {queryItems}
            </ListGroup>
            <QueryModal
               showModal={this.state.showModal}
               title={this.state.editQuery ? "Edit Question" : "New Question"}
               query={this.state.editQuery}
               onDismiss={this.modalDismiss} />
            <ConfDialog
               show={this.state.showConfirmation}
               title="Delete Conversation"
               body={`Are you sure you want to delete this Question 
                  ${this.state.delQuery && this.state.delQuery.summary}?`}
               buttons={['Yes', 'Abort']}
               onClose={answer => this.closeConfirmation(answer)}
            />
         </section>
      )
   }
}

const QueryItem = function (props) {
   return (
      <ListGroupItem>
         <Row>
            <Col sm={2}>{props.firstName + " " + props.lastName}</Col>
            <Col sm={2}>Class: {props.class}</Col>
            <Col sm={2}>Project: {props.project}</Col>
            <Col sm={2}>Prof. {props.professor}</Col>
            <Col sm={2}>Submitted: {new Intl.DateTimeFormat('us',
               {
                  year: "numeric", month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit", second: "2-digit"
               })
               .format(new Date(props.whenMade))}</Col>
            <Col sm={2}> 
               <Button bsSize="small" onClick={props.onDelete}>
               <Glyphicon glyph="trash" />
               </Button>
               <Button bsSize="small" onClick={props.onEdit}>
               <Glyphicon glyph="edit" />
               </Button>
               <Button bsSize="small" onClick={props.onMark}>
               <Glyphicon glyph="ok" />
               </Button>
            </Col>
         </Row>
         <Row>
            <Col sm={6}>Summary: {props.content}</Col> 
            <Col sm={4}>Position {props.pos} in Queue</Col>
         </Row>
      </ListGroupItem>
   )
}
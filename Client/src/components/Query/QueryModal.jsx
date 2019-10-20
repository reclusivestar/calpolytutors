import React, { Component } from 'react';
import {
   Modal, Button, FormControl, ControlLabel, FormGroup, HelpBlock
} from 'react-bootstrap';

export default class QueryModal extends Component {
   constructor(props) {
      super(props);
      this.state = {
         class: (this.props.query && this.props.query.class) || "",
         project: (this.props.query && this.props.query.project) || "",
         professor: (this.props.query && this.props.query.professor) || "",
         summary: (this.props.query && this.props.query.summary) || ""
      }
      console.log(props);
   }

   close = (result) => {
      this.props.onDismiss && this.props.onDismiss({
         status: result, 
         body : {
            class: this.state.class,
            summary: this.state.summary,
            project: this.state.project,
            professor: this.state.professor
         }
      });
   }

   getValidationState = (val) => {
      if (!val) {
         return "warning"
      }
      return null;
   }

   handleChange = (e) => {
      this.setState({ [e.target.name] : e.target.value });
   }

   componentWillReceiveProps = (nextProps) => {
      if (nextProps.showModal) {
         this.setState({ class: (nextProps.query && nextProps.query.class) 
            || "" ,
            project: (nextProps.query && nextProps.query.project) 
            || "" ,
            professor: (nextProps.query && nextProps.query.professor) 
            || "" ,
            summary: (nextProps.query && nextProps.query.summary) 
            || "" })
      }
   }

   render() {
      return (
         <Modal show={this.props.showModal} onHide={() => this.close("Cancel")}
         >
            <Modal.Header closeButton>
               <Modal.Title>{this.props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
               <form onSubmit={(e) =>
                  e.preventDefault() || this.state.class.length ?
                     this.close("Ok") : this.close("Cancel")}>
                  <FormGroup controlId="formBasicClass"
                     validationState={this.getValidationState(this.state.class)}
                  >
                     <ControlLabel>Class</ControlLabel>
                     <FormControl
                        type="text"
                        value={this.state.class}
                        placeholder="Enter Class"
                        name="class"
                        onChange={this.handleChange}
                     />
                     <FormControl.Feedback />
                  </FormGroup>
                  <FormGroup controlId="formBasicProf"
                     validationState={this.getValidationState(this.state.professor)}
                  >
                     <ControlLabel>Professor</ControlLabel>
                     <FormControl
                        type="text"
                        value={this.state.professor}
                        name="professor"
                        placeholder="Enter Professor Name"
                        onChange={this.handleChange}
                     />
                     <FormControl.Feedback />
                  </FormGroup>
                  <FormGroup controlId="formBasicProject"   
                     validationState={this.getValidationState(-1)}
                  >
                     <ControlLabel>Project</ControlLabel>
                     <FormControl
                        type="text"
                        value={this.state.project}
                        name="project"
                        placeholder="Enter Project"
                        onChange={this.handleChange}
                     />
                  </FormGroup>
                  <FormGroup controlId="formBasicQuestion"   
                     validationState={this.getValidationState(this.state.summary)}
                  >
                     <ControlLabel>Question</ControlLabel>
                     <FormControl
                        type="text"
                        value={this.state.summary}
                        name="summary"
                        placeholder="Enter a brief summary of your question"
                        onChange={this.handleChange}
                     />
                     <FormControl.Feedback />
                  </FormGroup>
               </form>
            </Modal.Body>
            <Modal.Footer>
               <Button onClick={() => this.close("Ok")}>Ok</Button>
               <Button onClick={() => this.close("Cancel")}>Cancel</Button>
            </Modal.Footer>
         </Modal>)
   }
}
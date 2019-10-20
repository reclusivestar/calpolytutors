import React, { PureComponent } from 'react';
import { Modal, Button } from 'react-bootstrap';

/**
 * Properties expected:
 * show: boolean
 * body: string
 * buttons: Array<string>
 */
export default class ErrorDialog extends PureComponent {
   constructor(props) {
      super(props);
      console.log("Constructing ConfDialog w/ ", props);
   }
   close = (result) => {
      this.props.onClose(result)
   }

   render() {
      console.log("ErrorDialog rerenders");
      return (
         <Modal show={this.props.show} onHide={() => this.close("Dismissed")}>
            <Modal.Header closeButton>
               <Modal.Title>{this.props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>  
            <div className = "alert alert-danger" role="alert">
            {this.props.body}
            </div>
            </Modal.Body>
            <Modal.Footer>
               {this.props.buttons.map((btn, i) => <Button key={i}
               onClick={() => this.props.onClose(btn)}>{btn}</Button>)}
            </Modal.Footer>
         </Modal>
      )
   }
}

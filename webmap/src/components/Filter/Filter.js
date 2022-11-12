import React from 'react';
import {Col, Container, FormLabel, Row} from "react-bootstrap";
import Select from "react-select";

const Filter = (props) => {
  const {variable_options, cmap_options, onChangeCmap, onChangeVariable} = props;
  return(
    <Container className={"mb-3"}>
      <Row className={"g-2"}>
        <Col md>
          <Row className={"g-1"}>
            <Col xs="auto">
              <FormLabel htmlFor={"cmap"} className={"bg-primary text-white p-2"}>Variable</FormLabel>
            </Col>
            <Col>
              <Select id={"variable"} options={variable_options} onChange={onChangeVariable} defaultValue={variable_options[0]}/>
            </Col>
          </Row>
        </Col>
        <Col md>
          <Row className={"g-1"}>
            <Col xs="auto">
              <FormLabel htmlFor={"cmap"} className={"bg-primary text-white p-2"}>CMAP</FormLabel>
            </Col>
            <Col>
              <Select id={"cmap"} options={cmap_options} onChange={onChangeCmap} defaultValue={cmap_options[0]}/>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default Filter;
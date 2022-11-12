import React from 'react';
import {Container, Navbar} from "react-bootstrap";

const ImosNavBar = () => {
  return(
    <Navbar className={"mb-5 bg-light border-bottom"}>
      <Container>
        <Navbar.Brand>
          <img
            alt=""
            src="/img.png"
            height="80"
            className={"align-center"}
          />
        </Navbar.Brand>
        <Navbar.Brand>
          <h3 className={"align-center"}>
            IMOS SST & Rio-tiler 🛰️🗺️
          </h3>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default ImosNavBar;
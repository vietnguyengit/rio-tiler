import React from 'react';
import {Container, Navbar} from "react-bootstrap";

const ImosNavBar = () => {
  return(
    <Navbar className={"mb-3 bg-light border-bottom"}>
      <Container>
        <Navbar.Brand>
          <img
            alt=""
            src="/img.png"
            height="70px"
            className={"align-center"}
          />
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default ImosNavBar;
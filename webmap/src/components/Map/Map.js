import React, { Component } from 'react';
import './Map.css'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

class Map extends Component {
  render(){
    const position = [51.505, -0.09];
    return (
      <React.Fragment>
        <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
        </MapContainer>
    </React.Fragment>);
  }
}


export default Map;
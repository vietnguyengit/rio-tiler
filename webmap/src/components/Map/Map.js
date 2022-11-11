import './Map.css'
import config from "../../config/config.json";
import React, { useRef, useEffect, useState } from "react";
import { MapContainer, TileLayer, LayerGroup, useMap } from "react-leaflet";
import "leaflet-timedimension";
import "leaflet/dist/leaflet.css";
import "leaflet-timedimension/dist/leaflet.timedimension.control.min.css";
import "iso8601-js-period";

const Map = (props) => {

  const position = [-30, 135];
  const {time_range} = props;
  const {cmap} = props;

  const timeDimensionOptions = {
    timeInterval: `${time_range["min_time"]}/${time_range["max_time"]}`,
    period: "P1D",
  };

  const timeDimensionControlOptions = {
    forwardButton: false,
    playButton: false,
    backwardButton: false,
    speedSlider: false
  }

  return (
    <MapContainer
      center={position}
      zoom={4}
      scrollWheelZoom={true}
      timeDimension
      timeDimensionOptions={timeDimensionOptions}
      timeDimensionControlOptions={timeDimensionControlOptions}
      timeDimensionControl
    >
      <Leaflet cmap={cmap}/>
    </MapContainer>
  );
};

const Leaflet = (props) => {

  const map = useMap();
  const [currentTimeIndex, setCurrentTimeIndex] = useState(-1);
  const {cmap} = props;
  map.timeDimension.on("timeloading", (data) => {
    setCurrentTimeIndex(data.target._currentTimeIndex);
  });

  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      // console.log(`_index: ${currentTimeIndex}`);
      ref.current.setUrl(`${config["rio_api"]}/tiles/{z}/{x}/{y}?&variable=sea_surface_temperature&idx=${currentTimeIndex}&cmap_name=${cmap}`);
    }
  }, [currentTimeIndex, cmap]);

  return (
    <React.Fragment>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayerGroup>
        <TileLayer
          ref={ref}
          url={""}
        />
      </LayerGroup>
    </React.Fragment>);
};

export default Map;

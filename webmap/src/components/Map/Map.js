import './Map.css'
import config from "../../config/config.json";
import React, {useRef, useEffect, useState, Component} from "react";
import { MapContainer, TileLayer, LayerGroup, useMap } from "react-leaflet";
import "leaflet-timedimension";
import "leaflet/dist/leaflet.css";
import "leaflet-timedimension/dist/leaflet.timedimension.control.min.css";
import "iso8601-js-period";
import MapLegend from "../MapLegend/MapLegend";
import {get_selected_date} from "../../helper/helper";


class Map extends Component {
  render() {
    const position = [-30, 135];
    const {time_range, cmap, map_variable} = this.props;
    const start_time_ms = Math.floor((new Date(time_range["min_time"])).getTime())
    const timeDimensionOptions = {
      timeInterval: `${time_range["min_time"]}/${time_range["max_time"]}`,
      period: "P1D",
      currentTime: start_time_ms
    };
    const timeDimensionControlOptions = {
      forwardButton: true,
      playButton: false,
      backwardButton: true,
      speedSlider: false,
      displayDate: false
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
          <Leaflet
            cmap={cmap}
            map_variable={map_variable}
            start_time={time_range["min_time"]}
          />
        </MapContainer>
    );
  }
}

const Leaflet = (props) => {
  const map = useMap();
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);

  const {start_time, cmap, map_variable} = props;
  const ref = useRef(null);
  const selectedDateRef = useRef(start_time);
  useEffect(() => {
    if (ref.current) {
      // console.log(`_index: ${currentTimeIndex}`);
      map.timeDimension.on("timeloading", async (data) => {
        const res = await get_selected_date(data.target._currentTimeIndex);
        selectedDateRef.current = res.data["selected_date"];
        setCurrentTimeIndex(data.target._currentTimeIndex);
      });
      ref.current.setUrl(`${config["rio_api"]}/tiles/{z}/{x}/{y}?&variable=${map_variable}&idx=${currentTimeIndex}&cmap_name=${cmap}`);
    }
  }, [currentTimeIndex, cmap, map_variable]);

  return (
    <React.Fragment>
      <p className={"fixed-bottom mx-2 h6 text-muted"}>{`Displaying: ${selectedDateRef.current}`}</p>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LayerGroup>
        <TileLayer
          ref={ref}
          url={""}
        />
      </LayerGroup>
      <MapLegend map={map}/>
    </React.Fragment>);
};

export default Map;

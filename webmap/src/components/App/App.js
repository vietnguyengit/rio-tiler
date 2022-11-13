import React, {Component} from "react";
import Map from "../Map/Map";
import config from '../../config/config.json';
import axios from "axios";
import RingLoader from 'react-spinners/RingLoader';
// import Filter from "../Filter/Filter";
import ImosNavBar from "../NavBar/ImosNavBar";


class App extends Component {
  state = {
    loading: null,
    time_range: {},
    cmap: "imos_rainbow",
    map_variable: "sea_surface_temperature"
  }

  componentWillMount = async () => {
    this.setState({
      loading: true
    })
    await axios.get(`${config["rio_api"]}/time_range`).then((res) => {
      const min_time = res.data["min_time"];
      const max_time = res.data["max_time"];
      this.setState({
        time_range: {
          min_time: min_time,
          max_time: max_time
        },
        loading: false
      });
    })
  }

  onChangeCmap = (data) => {
    // console.log(data["value"])
    this.setState({
      cmap: data["value"]
    })
  }

  onChangeVariable = (data) => {
    this.setState({
      map_variable: data["value"]
    })
  }

  render() {
    const {loading, time_range, cmap, map_variable} = this.state;
    const cmap_options = [
      { value: 'imos_rainbow', label: 'IMOS Rainbow (full custom)' }
    ]
    // a boilerplate
    const variable_options = [
      { value: 'sea_surface_temperature', label: 'sea_surface_temperature' }
    ]

    return (
      <React.Fragment>
        <ImosNavBar/>
        {/*<Filter*/}
        {/*  cmap_options={cmap_options}*/}
        {/*  variable_options={variable_options}*/}
        {/*  onChangeCmap={this.onChangeCmap}*/}
        {/*  onChangeVariable={this.onChangeVariable}*/}
        {/*/>*/}
        <div className={"d-flex justify-content-center mb-3 mt-3"}>
          <h3 className={"align-center"}>
            IMOS SST & Rio-tiler 🛰️🗺️
          </h3>
        </div>
        {
          loading ?
            <React.Fragment>
              <p className={"d-flex justify-content-center pt-3 pb-3"}>
                Loading map data...
              </p>
              <div className={"d-flex justify-content-center pt-3 pb-3"}>
                <RingLoader/>
              </div>
            </React.Fragment>
          :
            <React.Fragment>
              <Map time_range={time_range} cmap={cmap} map_variable={map_variable}/>
            </React.Fragment>
        }
        <div className={"d-flex justify-content-end mx-2 fixed-bottom"}>
          <p>Viet Nguyen | IMOS</p>
        </div>
      </React.Fragment>
    )
  }
}

export default App;

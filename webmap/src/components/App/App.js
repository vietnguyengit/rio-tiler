import React, {Component} from "react";
import Map from "../Map/Map";
import {AlertDismissible} from '../Notes/Notes';
import config from '../../config/config.json';
import axios from "axios";
import RingLoader from 'react-spinners/RingLoader';
import Select from 'react-select';
import {FormLabel} from "react-bootstrap";


class App extends Component {
  state = {
    loading: null,
    time_range: {},
    cmap: "imos_viridis"
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

  onChange = (data) => {
    // console.log(data["value"])
    this.setState({
      cmap: data["value"]
    })
  }

  render() {
    const {loading, time_range, cmap} = this.state;
    const options = [
      { value: 'imos_viridis', label: 'IMOS Viridis' },
      { value: 'imos_plasma', label: 'IMOS Plasma' },
      { value: 'imos_cividis', label: 'IMOS Cividis' }
    ]
    return (
      <React.Fragment>
        <div className={"mx-2"}>
          <AlertDismissible/>
        </div>
        <div>
          <h2 className={"d-flex justify-content-center pt-3 pb-3"}>
            IMOS SST & Rio-tiler 🛰️🗺️
          </h2>
        </div>
        <div className={"d-flex justify-content-end mt-2 mx-2 mb-2"}>
          <FormLabel htmlFor={"cmap"} className={"col-form-label mx-2"}>CMAP: </FormLabel>
          <div className={"col-sm-5"}>
            <Select id={"cmap"} options={options} onChange={this.onChange} defaultValue={options[0]} menuPortalTarget={document.body}/>
          </div>
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
              <Map time_range={time_range} cmap={cmap}/>
            </React.Fragment>
        }
        <p className={"d-flex justify-content-end mx-2 fixed-bottom"}>Viet Nguyen | IMOS | Hobart, Tasmania</p>
      </React.Fragment>
    )
  }
}

export default App;

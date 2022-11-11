import React, {Component} from "react";
import Map from "../Map/Map";
import {AlertDismissible} from '../Notes/Notes';
import config from '../../config/config.json';
import axios from "axios";
import RingLoader from 'react-spinners/RingLoader';

class App extends Component {
  state = {
    loading: null,
    time_range: {}
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

  render() {
    const {loading, time_range} = this.state;
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
        {
          loading ?
            <React.Fragment>
              <p className={"d-flex justify-content-center pt-3 pb-3"}>
                Loading map data...
              </p>s
              <div className={"d-flex justify-content-center pt-3 pb-3"}>
                <RingLoader/>
              </div>
            </React.Fragment>
          :
            <React.Fragment>
              <Map time_range={time_range}/>
            </React.Fragment>
        }
        <p className={"d-flex justify-content-end mx-2 fixed-bottom"}>Viet Nguyen | IMOS | Hobart, Tasmania</p>
      </React.Fragment>
    )
  }
}

export default App;

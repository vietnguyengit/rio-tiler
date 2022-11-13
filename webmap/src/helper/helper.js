import config from "../config/config.json";
import axios from "axios";
const rio_api = config["rio_api"];


export function get_selected_date(index) {
  return axios.get( `${rio_api}/time_range/date?idx=${index}`);
}

export function get_time_range() {
  return axios.get(`${config["rio_api"]}/time_range`);
}

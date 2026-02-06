import axios from "axios";
import baseurl from "./baseurl";

export default axios.create({
  baseURL: baseurl,
  withCredentials: true,
});
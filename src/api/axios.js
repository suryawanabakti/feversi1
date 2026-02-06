import axios from "axios";
import baseurl from "./baseurl";

export default axios.create({
  baseURL: baseurl,
  withCredentials: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json",
  },
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});
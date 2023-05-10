const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const PORT = 5000; // 5000, as we need to separate it from the port we use for our frontend app
const app = express();

app.use(cors());
const corsOptions = {
  origin: "http://localhost:3000",
};

// const requestEndpoint = "https://xkcd.com/327/info.0.json";
// const requestEndpoint = "http://localhost:5000/getData";
const requestEndpoint = "https://joch82.kintone.com/k/v1/records.json?app=1";

// Express commonly uses routing that defines how the serve's endpoint will respond to our frontend app's requests.
// This function runs if the http://localhost:5000/getData endpoint
// is requested with a GET request

// But by default, our Express server will return CORS errors if access from our frontend app that lies on a
// different domain(port).By setting up some CORS options, we allow requests from that port to access our
// resources that lie on 'https://localhost:5000/getData'
app.get("/getData", cors(corsOptions), async (req, res) => {
  const fetchOptions = {
    method: "GET",
    headers: {
      "X-Cybozu-API-Token": process.env.API,
    },
  };
  const response = await fetch(requestEndpoint, fetchOptions);
  // parameters:
  // const parameters = "?app=1&query=order by start desc";
  // const response = await fetch(requestEndpoint+parameters, fetchOptions);
  const jsonResponse = await response.json();
  res.json(jsonResponse);
});

app.listen(PORT, () => {
  console.log(
    `US President timeline app listening at https://localhost:${PORT}`
  );
});

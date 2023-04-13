const express = require("express");
var cors = require("cors");
const fs = require("fs");
const { get } = require("axios");
const app = express();

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const API_KEY = "f1c896024db89e75d43930de";

app.get("/", (req, res) => {
  return res.send("Hello World");
});

app.get("/ppp/:from/:to/:salary", cors(corsOptions), async (req, res) => {
  const { from, to } = req.params;
  const dataJson = JSON.parse(fs.readFileSync("./final.json"));
  const toCurrency = dataJson[to.toLowerCase()]["currency_code"];
  const fromCurrency = dataJson[from.toLowerCase()]["currency_code"];
  const CURRENCY_URL_TO = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/USD/${toCurrency}`;
  const CURRENCY_URL_FROM = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/USD/${fromCurrency}`;
  const promises = [get(CURRENCY_URL_TO), get(CURRENCY_URL_FROM)];
  const resps = await Promise.all(promises);
  const rateTo = resps[0].data.conversion_rate;
  const rateFrom = resps[1].data.conversion_rate;
  const direct = rateTo / rateFrom;
  const factor =
    dataJson[to.toLowerCase()]["PPP"] /
    dataJson[from.toLowerCase()]["PPP"] /
    direct;
  const newSalary = req.params.salary * factor * direct;
  return res.status(200).send({ factor, direct, newSalary });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server is running on port" + (process.env.PORT || 3000));
});

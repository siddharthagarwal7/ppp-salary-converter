// Get HTML elements from the DOM
var fromCountry = document.getElementById('source-country');
var toCountry = document.getElementById('target-country');
var salary = document.getElementById('salary');
var output = document.getElementById('output');

// Define the API key for the currency conversion API
const API_KEY = "544024e8495c81f7d911163f";

// Define an asynchronous function to convert salary to another currency based on the selected countries
var convertedData = async () => {
    // Get the country data from a JSON file
    const res = await fetch('final.json');
    const dataJson = await res.json();

    // Get the currency codes for the selected countries
    const toCurrency = dataJson[toCountry.value.toLowerCase()]["currency_code"];
    const fromCurrency = dataJson[fromCountry.value.toLowerCase()]["currency_code"];

    // Define the URLs to fetch the exchange rates for the currencies
    const CURRENCY_URL_TO = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/USD/${toCurrency}`;
    const CURRENCY_URL_FROM = `https://v6.exchangerate-api.com/v6/${API_KEY}/pair/USD/${fromCurrency}`;

    // Fetch the exchange rate data for the currencies
    const promises = [fetch(CURRENCY_URL_TO).then(res => res.json()), fetch(CURRENCY_URL_FROM).then(res => res.json())];
    const resps = await Promise.all(promises)

    // Get the exchange rates for the currencies
    const rateTo = resps[0].conversion_rate;
    const rateFrom = resps[1].conversion_rate;

    // Calculate the conversion factor based on purchasing power parity
    const direct = rateTo / rateFrom;
    const factor = dataJson[toCountry.value.toLowerCase()]["PPP"] / dataJson[fromCountry.value.toLowerCase()]["PPP"] / direct;

    // Calculate the new salary in the target currency
    const finalSalary = salary.value * factor * direct;

    // Display the new salary in the output field
    output.value = finalSalary;
}

// Add an event listener to the salary input field to trigger the conversion function when the Enter key is pressed
salary.addEventListener('keydown', (e) => {
    if (e.code === "Enter") convertedData();
});
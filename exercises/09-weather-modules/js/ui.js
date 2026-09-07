import { weatherMap } from "./data.js";


const weatherEmoji = document.getElementById('weatherEmoji');
const cityName = document.getElementById('cityName');
const temp = document.getElementById('temp');
const wind = document.getElementById('wind');
export const status = document.getElementById('status');

export function displayWeather(city,temperature,windspeed,code) {
    cityName.textContent = city + `市`;
    temp.textContent = temperature + `°C`;
    wind.textContent = '风速: ' + windspeed + ` km/h`;
    weatherEmoji.textContent = getEmoji(code);

    status.textContent = ``;
    status.className = ``;
}

function getEmoji(code) {
    return weatherMap[code] ?? `❓`;
}
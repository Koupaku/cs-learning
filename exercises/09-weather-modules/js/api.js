import { cities } from "./data.js";
import {displayWeather} from "./ui.js"
import { status } from "./ui.js";


export async function fetchWeather(city) {
    try{
        status.textContent = `loading...`
        status.className = 'loading'
        const { lat,lon } = cities[city];
        const ticket = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const response = await ticket;
        const data = await response.json();

        const temp = data.current_weather.temperature;
        const wind = data.current_weather.windspeed;
        const code = data.current_weather.weathercode;

        displayWeather(city,temp,wind,code);
    } catch(error) {
        status.textContent = '查询失败:' + error.message;
        status.className = 'error';
    } 
}


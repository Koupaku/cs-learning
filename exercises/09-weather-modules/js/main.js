import {fetchWeather} from "./api.js";



document.querySelectorAll('.city-btn').forEach((btn) =>{
    btn.addEventListener('click',() =>{
        fetchWeather(btn.dataset.city);
    });
})
const cityname = document.getElementById('cityname');
const temp = document.getElementById('temp');
const wind = document.getElementById('wind');
const status = document.getElementById('status');

const cities = {
  北京 : { lat: 39.9 , lon: 116.4},
  上海: { lat: 31.2, lon: 121.5 },
  广州: { lat: 23.1, lon: 113.3 },
  深圳: { lat: 22.5, lon: 114.1 },
};

async function fetchWeather(city) {
    try{
        status.textContent = `加载中...`;
        const {lat,lon} = cities[city];
        const ticket = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const response = await ticket;
        const data = await response.json();

        temp = data.current_weather.temperature;
        wind = data.current_weather.windspeed;

        status.textContent = `${city}:${temp}°C，风速${wind} km/h`;
    } catch(error){
        status.textContent = `查询失败:` + error.message ;
    }

}
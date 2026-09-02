// 练习 05：天气卡片 🌤️
// 任务说明见 README.md
// 新零件 fetch / async / await 的打样在：notes/05-异步与fetch打样/
// 这是阶段 1 的重头戏：让程序第一次"接触外面的世界"（联网）

// ===== 抓元素 =====
const cityName = document.getElementById('cityName');
const temp = document.getElementById('temp');
const wind = document.getElementById('wind');
const status = document.getElementById('status');

// ===== 城市坐标表（不用查 API，直接给你） =====
const cities = {
  北京: { lat: 39.9, lon: 116.4 },
  上海: { lat: 31.2, lon: 121.5 },
  广州: { lat: 23.1, lon: 113.3 },
  深圳: { lat: 22.5, lon: 114.1 },
};

// ===== TODO 1: 查询天气（核心！照着打样零件 3 写） =====
async function fetchWeather(city) {
  try {
  // 要求：
  // 1. 显示"加载中..."（把 status 的文字改一下）
  // 2. 拼 URL（注意用模板字符串）：
  //    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
  //    （lat/lon 从 cities 对象里取：cities[city].lat）
  // 3. await fetch(URL)  → 拿到 response
  // 4. await response.json() → 拿到 data
  // 5. 从 data.current_weather 取出 temperature 和 windspeed
  // 6. 调用 displayWeather(city, temp, wind)（下面给你写好了）
  // 7. 出错时（try/catch）：把 status 改成错误信息（打样零件 4）
    status.textContent = `加载中...`
    const { lat,lon } = cities[city];
    ////const ticket = fetch(`http://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    const ticket = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    const response = await ticket;
    const data = await response.json();
    const temp = data.current_weather.temperature;
    const wind = data.current_weather.windspeed;
    ////console.log(`${cities[city].textContent}}现在的温度${temp}°C，风速${wind} km/h`);
    ////const weatherDiv = document.getElementById('weather');
    ////weatherDiv.textContent = `${cities[city]}:${temp}°C，风速 ${wind} km/h`;
    ////displayWeather.textContent = `${city}:${temp}°C，风速 ${wind} km/h`;
    displayWeather(city,temp,wind);
  } catch(error) {
    status.textContent = '查询失败：' + error.message;
  }
}



// ===== 显示（已写好，不用改） =====
function displayWeather(city, temperature, windspeed) {
  cityName.textContent = city;
  temp.textContent = temperature + '°C';
  wind.textContent = '风速 ' + windspeed + ' km/h';
  status.textContent = '';
}

// ===== 绑定事件 =====
// 所有城市按钮共用一套逻辑：点击 → 取按钮上的 data-city → 查询
document.querySelectorAll('.city-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    fetchWeather(btn.dataset.city);
  });
});
0
// 练习 07：天气卡片 2.0（装修版）
// 把练习 05 的逻辑搬过来，加上：天气图标 + 状态配色
// 建议：打开练习 05 的 app.js 对照着改

// ===== 抓元素 =====
const cityName = document.getElementById('cityName');
const weatherEmoji = document.getElementById('weatherEmoji');
const temp = document.getElementById('temp');
const wind = document.getElementById('wind');
const status = document.getElementById('status');

// ===== 城市坐标表（同练习 05） =====
const cities = {
  北京: { lat: 39.9, lon: 116.4 },
  上海: { lat: 31.2, lon: 121.5 },
  广州: { lat: 23.1, lon: 113.3 },
  深圳: { lat: 22.5, lon: 114.1 },
};

// ===== TODO 1: 天气代码 → emoji 查表 =====
// open-meteo 用数字表示天气（weathercode）：
//   0 晴 | 1,2,3 多云 | 45,48 雾 | 51~67 雨 | 71~77 雪 | 80~82 阵雨 | 95+ 雷暴
// 像 cities 一样建一个对象查表：
//   const weatherMap = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
//                        51: '🌦️', 53: '🌦️', 55: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
//                        71: '🌨️', 73: '🌨️', 75: '🌨️', 80: '🌦️', 81: '🌦️', 82: '🌦️',
//                        95: '⛈️', 96: '⛈️', 99: '⛈️' };
// 再写：function getEmoji(code) { return weatherMap[code] ?? '❓'; }
// （?? 叫"空值合并"：查不到（undefined）时用 ❓ 兜底，新语法混脸熟）
const weatherMap = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '🌨️', 80: '🌦️', 81: '🌦️', 82: '🌦️', 
  95: '⛈️', 96: '⛈️', 99: '⛈️' };

function getEmoji(code) { return weatherMap[code] ?? `❓`;}

// ===== TODO 2: 查询天气（从练习 05 复制并改造） =====
// async function fetchWeather(city) {
//   try {
//     ...（同练习 05：加载中、fetch、json、提取温度风速）
//     const code = data.current_weather.weathercode;   // ★ 新增：多取一个天气代码
//     displayWeather(city, temperature, windspeed, code);  // ★ 多传一个参数
//   } catch (error) {
//     status.textContent = '查询失败：' + error.message;
//     status.className = 'error';      // ★ 新增：给状态行加红色 class（CSS 已备好）
//   }
// }
// 另外：加载中时 status.className = 'loading';（蓝色）
async function  fetchWeather(city) {
  try{
    const { lat , lon } = cities[city];
    const ticket = fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    const response = await ticket;
    const data = await response.json();
    const temp = data.current_weather.temperature;
    const wind = data.current_weather.windspeed;
    const code = data.current_weather.weathercode;

    displayWeather(city,temp,wind,code);
  } catch (error) {
    status.textContent = '查询失败:' + error.message;
    status.className = 'error'; //className是什么
  }
}
// ===== TODO 3: 显示（多了一个 emoji） =====
// function displayWeather(city, temperature, windspeed, code) {
//   cityName.textContent = city;
//   weatherEmoji.textContent = getEmoji(code);
//   temp.textContent = temperature + '°C';
//   wind.textContent = '风速 ' + windspeed + ' km/h';
//   status.textContent = '';
//   status.className = '';
// }
function displayWeather(city,temperature,windspeed,code) {
  cityName.textContent = city;
  weatherEmoji.textContent = getEmoji(code);
  temp.textContent = temperature + '°C';
  wind.textContent = '风速 ' + windspeed + ' km/h ';
  status.textContent = '';
  status.className = '';
}
// ===== 绑定事件（同练习 05） =====
// document.querySelectorAll('.city-btn').forEach((btn) => {
//   btn.addEventListener('click', () => {
//     fetchWeather(btn.dataset.city);
//   });
// });


 document.querySelectorAll('.city-btn').forEach((btn) => {
   btn.addEventListener('click', () => {
     fetchWeather(btn.dataset.city);
   });
 });

# 练习 05：天气卡片 🌤️

> 主题：fetch / async / await（前端最重要的异步编程）
> 难度：入门+ · 预计 2~3 小时
> 意义：**你的程序第一次联网**。从此你的作品不再只是"自娱自乐"，而是能接入真实世界的数据。
> 新零件打样：`notes/05-异步与fetch打样/`（先跑通它！）

---

## 功能要求

1. 点击城市按钮（北京/上海/广州/深圳）→ 显示该城市实时温度、风速
2. 查询时显示"加载中..."
3. 网络出错时显示友好提示（不能悄悄失败）

## 使用的 API（免费、无需注册）

```
https://api.open-meteo.com/v1/forecast?latitude=39.9&longitude=116.4&current_weather=true
```

在浏览器地址栏打开这个网址，你会看到一堆 JSON——那就是服务器给你的数据。看看你能不能找到 `temperature` 和 `windspeed` 藏在哪。

## 新概念速览（详细版在打样里）

```js
async function 函数名() {          // async：声明这是"异步函数"（里面才能用 await）
  const response = await fetch(网址);  // await：等网络回应（可能要几百毫秒）
  const data = await response.json();  // 把回应解析成对象
  // 然后 data.current_weather.temperature 就能用了
}
```

## 验收标准

- [ ] 点"北京" → 显示温度（比如 25.3°C）和风速
- [ ] 连点不同城市 → 数据跟着变
- [ ] 断网或改错网址 → 页面显示错误提示，而不是一片空白

## 完成后

```bash
git add .
git commit -m "练习05完成：天气卡片"
git push
```

## 加分项

1. **任意城市**：加一个输入框，用 Open-Meteo 的搜索接口查出任意城市坐标再查询（`https://geocoding-api.open-meteo.com/v1/search?name=北京`）
2. **天气图标**：根据 `weathercode`（天气代码）显示 ☀️/☁️/🌧️ 表情（代码表在 https://open-meteo.com/en/docs 搜 "weathercode"）
3. **刷新按钮**：自动每隔 10 分钟刷新一次（提示：setInterval 你已经会了）

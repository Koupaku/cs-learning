// 练习 01：成绩分析器
// 任务说明见 README.md
// 规则：每题用指定方法（reduce / filter / map / 展开运算符），不许用 for 循环

// 学生数组：{ name: 姓名, score: 分数 }
const students = [
  { name: '小明', score: 85 },
  { name: '小红', score: 92 },
  { name: '李雷', score: 95 },
  { name: '韩梅梅', score: 67 },
  { name: '小刚', score: 58 },
  { name: '阿花', score: 52 },
];

// 1. 用 reduce 算平均分（保留 2 位小数）
function calcAverage(scores) {
   //TODO: 在这里写代码
  const total = scores.reduce((acc,s) => acc + s,0);
  //const Average = total/scores.length;
  //const calcAverageAverage = Average.toFixed(2);
  return (total/scores.length).toFixed(2); //calcAverageAverage;

};

// 2. 用 Math.max / Math.min + 展开运算符 ... 找最高分和最低分
function findMax(scores) {
  // TODO
  const max = Math.max(...scores);
  return max;
};

function findMin(scores) {
  // TODO
  const min = Math.min(...scores);
  return min;
};


// 3. 用 filter 过滤出及格（>= 60）的同学，返回名字数组，如 ['小明', '小红']
function getPassed(students) {
  // TODO
  //const passed = students.filter((s)>= s >= 60);
  //const passed = students.fliter((s)>= s >= 60).map((s)s => s.name)\/////////////
  //D:\YMZZZZZ\STUDY\ComputerScience\exercises\01-score-analyzer\scores.js:43   //
  //const passed = students.fliter((s)>= s >= 60).map((s)s => s.name)           //
 // //////////////////////////////////////////////////////////////////////////////////
//SyntaxError: missing ) after argument list


  
 // const passed = students.fliter(s => s.score >= 60).map(s => s.name);
 // //抄的代码也报错，具体如下
  const passed = students.filter(s => s.score >= 60).map(s => s.name);
 //D:\YMZZZZZ\STUDY\ComputerScience\exercises\01-score-analyzer\scores.js:48
 //TypeError: students.fliter is not a function   顺便问一下怎么一次性注释多行

  return passed //怎么返回名字数组,不会。
};

// 4. 用 map 给每个分数加 5%（即 ×1.05）
function boostScores(scores) {
  // TODO
  const boost105 = scores.map(s => Math.round(s * 1.05 * 100)/100);
  
  //const boosted = Math.round((...scores) * 1.05 * 100 ) / 100;
  return boost105;
};

// 5. 找出最高分同学，用模板字符串返回 "李雷，95 分"
function formatTopStudent(students) {
  // TODO
  //const top = scores.filter((s) s >= s); //使用大的值一直替换掉小的值
  //return(`${students.}`,`${formatTopStudent(students)}分`);
  const top = students.reduce((best,s) => s.score > best.score ? s:best);
  return `${top.name}， ${top.score}分`;

};

// ---------- 以下为测试代码，不要修改 ----------
const scores = students.map((s) => s.score);

console.log(`全班 ${students.length} 人，平均分 ${calcAverage(scores)}，最高分 ${findMax(scores)}，最低分 ${findMin(scores)}`);
console.log(`及格（≥60）：${students.length} 人中的 ${getPassed(students).length} 人`);
console.log(`加分 5% 后的成绩：[${boostScores(scores).join(', ')}]`);
console.log(`最高分同学：${formatTopStudent(students)}`);

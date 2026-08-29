const score = [85, 92, 95, 67, 58, 52]
const doubled = score.map((s) => s * 2);
console.log(doubled);

const getPassed = score.filter((s) => s >= 60);
console.log(getPassed);

const total =score.reduce((acc,s) => acc + s,s = 0);
console.log(total);

///const doubled = (n) => n * 2;  不注释的话SyntaxError: Identifier 'doubled' has already been declared

const name = '小明';
console.log(`你好,${name}`);

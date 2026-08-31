const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

let running = false ;
let seconds = 0 ;
let timer = null ;

function start(){
    if(running){return;}
    timer = setInterval(tick,100);
}

function tick(){
    seconds = seconds + 0.1;
    display.textContent = seconds.toFixed(1) + ` 秒`;
}

function pause(){
    clearInterval(timer);
    running = false;
}

function reset(){
    pause();
    seconds = 0 ;
    display.textContent = seconds.toFixed(1)+` 秒`;
}

startBtn.addEventListener('click',start);
pauseBtn.addEventListener('click',pause);
resetBtn.addEventListener('click',reset);
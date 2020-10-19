onload = function() {
    let BATTLE = {
        playing: false,
        userLock: false,

        timer: null,
        count: 0,
        count2: 3,
        
        hour: '00',
        minute: '00',
        second: '00',
    };
            
    const FACE_INDEX = ['U', 'L', 'F', 'R', 'B', 'D'];
    const FACE_INDEX_FOR_AI = ['U', 'F', 'L', 'D', 'B', 'R'];
    const DIR_INDEX = ['R', 'L'];
    const REVERSE_DIR = {R: 'L', L: 'R'};

    let userCube = new Cube('User');
    let stack = [];
    
    const aiCube = new Cube('Ai');
    const etcCube = new Cube('Etc');
    
    const userBox = document.getElementById('userBox');
    const aiBox = document.getElementById('aiBox');
    const etcBox = document.getElementById('etcBox');
    
    const userH = document.getElementById('userH');
    const aiH = document.getElementById('aiH');
    const etcH = document.getElementById('etcH');
    
    const readyGameControl = document.getElementById('readyGameControl');
    
    const shuffle = document.getElementById('shuffle');
    const refresh = document.getElementById('refresh');
    const importData = document.getElementById('import');
    const exportData = document.getElementById('export');
    
    const inGameControl = document.getElementById('inGameControl');
    
    const surrender = document.getElementById('surrender');
    
    const battleBox = document.getElementById('battleBox');
    const battleDesc = document.getElementById('battleDesc');
    const battle = document.getElementById('battle');

    const userCanvas = [
        document.getElementById('userU'),
        document.getElementById('userL'),
        document.getElementById('userF'),
        document.getElementById('userR'),
        document.getElementById('userB'),
        document.getElementById('userD')
    ];
    const aiCanvas = [
        document.getElementById('aiU'),
        document.getElementById('aiL'),
        document.getElementById('aiF'),
        document.getElementById('aiR'),
        document.getElementById('aiB'),
        document.getElementById('aiD'),
    ];
    const etcCanvas = [
        document.getElementById('etcU'),
        document.getElementById('etcL'),
        document.getElementById('etcF'),
        document.getElementById('etcR'),
        document.getElementById('etcB'),
        document.getElementById('etcD'),
    ];

    const rotationLeft = [
        document.getElementById('UL'),
        document.getElementById('LL'),
        document.getElementById('FL'),
        document.getElementById('RL'),
        document.getElementById('BL'),
        document.getElementById('DL'),
    ];

    const rotationRight = [
        document.getElementById('UR'),
        document.getElementById('LR'),
        document.getElementById('FR'),
        document.getElementById('RR'),
        document.getElementById('BR'),
        document.getElementById('DR'),
    ];

    updateCube(userCanvas, userCube.map);
    updateCube(aiCanvas, aiCube.map);
    updateCube(etcCanvas, etcCube.map);
    
    for (let i = 0; i < 6; i++) {
        rotationLeft[i].onclick = rotationEvent;
        rotationRight[i].onclick = rotationEvent;
    }
    
    function rotationEvent() {
            const rotationFace = this.id.slice(0, 1);
            const rotationDir = this.id.slice(1, 2);
            
            if (BATTLE.userLock === false) {
                userCube.rotation(rotationFace, rotationDir);
                updateCube(userCanvas, userCube.map);

                if (userCube.state === 'complete') {
                    if (BATTLE.playing === true) {
                        BATTLE.userLock = true;
                        inGameControl.hidden = true;
                        checkEndBattle('user');
                    }
                    stack = [];
                } else {
                    stack.push([rotationFace, REVERSE_DIR[rotationDir]]);
                }
            }
    }
    
    shuffle.onclick = cubeShuffle;
    
    function cubeShuffle() {
        shuffle.onclick = null;
        refresh.onclick = null;
        importData.onclick = null;
        exportData.onclick = null;
        battle.onclick = null;
        
        BATTLE.userLock = true;
        
        let shuffleCount = Number(prompt('How many shuffle do you want?'));
        if (!(shuffleCount > 0 && shuffleCount < 100)) {
             shuffleCount = 10;   
        }
        let shuffleInterval = 500;
        
        const shuffleTimer = setInterval(function() {
            const faceRandomNum = Math.floor(Math.random() * 6);
            const dirRandomNum = Math.floor(Math.random() * 2);
            
            userCube.rotation(FACE_INDEX[faceRandomNum], DIR_INDEX[dirRandomNum]);
            updateCube(userCanvas, userCube.map);
            
            if (userCube.state === 'complete') {
                stack = [];
            } else {
                stack.push([FACE_INDEX[faceRandomNum], REVERSE_DIR[DIR_INDEX[dirRandomNum]]]);
            }
            
            shuffleCount--;
            if (shuffleCount === 0) {
                clearInterval(shuffleTimer);
                
                shuffle.onclick = cubeShuffle;
                refresh.onclick = cubeRefresh;
                importData.onclick = importCubeData;
                exportData.onclick = exportCubeData;
                battle.onclick = battleStart;

                BATTLE.userLock = false;                
            }
        }, shuffleInterval);  
    }
    
    refresh.onclick = cubeRefresh;
    
    function cubeRefresh() {
        userCube = new Cube('User');
        updateCube(userCanvas, userCube.map);
        stack = [];
    }
    
    importData.onclick = importCubeData;
        
    function importCubeData() {
        const data = prompt('Paste the data');
        if (data) {
            userCube.map = JSON.parse(data);
            userCube.checkMap();
            updateCube(userCanvas, userCube.map);
            stack = [];
        }
    }
    
    exportData.onclick = exportCubeData;
        
    function exportCubeData() {
        alert('Copy: ' + JSON.stringify(userCube.map));
    }
    
    surrender.onclick = function() {
        inGameControl.hidden = true;
        BATTLE.userLock = true;
        checkEndBattle('user', true);
    };

    battle.onclick = battleStart;
    
    function battleStart() {
        if (userCube.state === 'playing') {
            battle.onclick = null;
            BATTLE.playing = true;
            
            
            // 화면 변환
            userBox.classList.add('battle');
            aiBox.classList.add('battle');
            etcBox.classList.add('battle');
            
            // header 초기화
            userH.innerHTML = 'USER';
            aiH.innerHTML = 'AI';
            etcH.innerHTML = 'ETC';
            
            // Battle Box
            let time = 0;
            battleBox.classList.add('battle');
            battleDesc.innerHTML = 'Playing 00:00:00';
            
            BATTLE.timer = setInterval(function() {
                time++;
                BATTLE.hour = ('00' + Math.floor(time/3600)).slice(-2);
                BATTLE.minute = ('00' + Math.floor(time/60)%60).slice(-2);
                BATTLE.second = ('00' + time%60).slice(-2);
                battleDesc.innerHTML = `Playing ${BATTLE.hour}:${BATTLE.minute}:${BATTLE.second}`;
            }, 1000);
            
            
            // USER
            readyGameControl.hidden = true;
            inGameControl.hidden = false;
            
            // AI
            //solveAI(userCube, aiCube, aiCanvas);
            //solveReverse('ai', userCube, aiCube, aiCanvas, stack, 1000);
            solveAlgo(userCube, aiCube, aiCanvas);
            
            // ETC
            solveReverse('etc', userCube, etcCube, etcCanvas, stack, 1000);
        }
    }
    
    function checkEndBattle(name, surrender) {
        const header = document.getElementById(name + 'H');

        if (surrender) {
            header.innerHTML += ` SURRENDER`;
            BATTLE.count2--;
        } else {
            header.innerHTML += ` ${BATTLE.hour}:${BATTLE.minute}:${BATTLE.second}`;
            BATTLE.count++;
            if (BATTLE.count === 1) {
                header.innerHTML += ' VICTORY';
                console.log(`${name} WIN!`);

            }
        }
        
        if (BATTLE.count === BATTLE.count2) {
            clearInterval(BATTLE.timer);
            battleDesc.innerHTML = 'End Battle!';
            
            setTimeout(function() {
                console.log('End Battle!');


                BATTLE.playing = false;
                BATTLE.userLock = false;

                BATTLE.count = 0;
                BATTLE.count2 = 3;
                BATTLE.hour = '00';
                BATTLE.minute = '00';
                BATTLE.second = '00';

                userBox.classList.remove('battle');
                aiBox.classList.remove('battle');
                etcBox.classList.remove('battle');

                readyGameControl.hidden = false;
                inGameControl.hidden = true;

                battleBox.classList.remove('battle');
                battleDesc.innerHTML = 'Battle!';

                battle.onclick = battleStart;
            }, 5000);
        }

    }
    
    function solveAI(target) {
        aiCube.map = JSON.parse(JSON.stringify(target.map));
        updateCube(aiCanvas, aiCube.map);
        
        const data = {cubeData: `${aiCube.map}`};
        sendAjaxAI('https://ilscp3000.run.goorm.io/ai', JSON.stringify(data));
    }
    
    function sendAjaxAI(url, data) {
        const xhr = new XMLHttpRequest();
        xhr.open('post', url);
        xhr.setRequestHeader('Content-type', "application/json");

        xhr.onload = function() {
            const MESSAGE = xhr.responseText.split(' ');
			
            aiCube.rotation(FACE_INDEX_FOR_AI[MESSAGE[0]], DIR_INDEX[MESSAGE[1]]);
            updateCube(aiCanvas, aiCube.map);

            if (aiCube.state === 'complete') {
                checkEndBattle('ai');
            } else {
                const data = {cubeData: `${aiCube.map}`};
                sendAjaxAI('https://ilscp3000.run.goorm.io/ai', JSON.stringify(data));
            }
        };
        xhr.send(data);
    }

    function solveAlgo(target) {
        aiCube.map = JSON.parse(JSON.stringify(target.map));
        updateCube(aiCanvas, aiCube.map);
        
        const data = {cubeData: `${aiCube.map}`};
        sendAjaxAlgo('https://ilscp3000.run.goorm.io/ai', JSON.stringify(data));
    }
    
    function sendAjaxAlgo(url, data) {
        const xhr = new XMLHttpRequest();
        xhr.open('post', url);
        xhr.setRequestHeader('Content-type', "application/json");

        xhr.onload = function() {
            const MESSAGE = xhr.responseText;
			console.log(MESSAGE);
			
			let answer;
			
           // aiCube.rotation(FACE_INDEX_FOR_AI[MESSAGE[0]], DIR_INDEX[MESSAGE[1]]);
           // updateCube(aiCanvas, aiCube.map);
        };
        xhr.send(data);
    }
	
    function solveReverse(name, target, cube, canvas, stack, interval) {
        const tmp = JSON.parse(JSON.stringify(stack));
        cube.map = JSON.parse(JSON.stringify(target.map));
        cube.checkMap();
        updateCube(canvas, cube.map);
        
        if (tmp.length === 0) {
            checkEndBattle(name, true);
            return;
        }
        
        const timer = setInterval(function() {
            const data = tmp.pop();
            cube.rotation(data[0], data[1]);
            updateCube(canvas, cube.map);
            if (tmp.length === 0) {
                clearInterval(timer);
                if (cube.state === 'complete') {
                    checkEndBattle(name);
                } else {
                    checkEndBattle(name, true);
                }
            }
        }, interval);

    }
};


function drawCell(ctx, xd, yd, color) {
    const width = ctx.canvas.width - 4;
    const height = ctx.canvas.height - 4;
    const sx = xd * width / 3 + 2;
    const sy = yd * height / 3 + 2;

    const radius = width/9;
    
    drawRadiusRect(ctx, sx, sy, width, height, radius, color);
}

function drawRadiusRect(ctx, sx, sy, width, height, radius, color) {
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    for (let i = 0; i < 2; i++) {
        ctx.beginPath();
        ctx.moveTo(sx + radius, sy);
        ctx.arcTo(sx + width/3, sy, sx + width/3, sy + height/3, radius);
        ctx.arcTo(sx + width/3, sy + height/3, sx, sy + height/3, radius);
        ctx.arcTo(sx, sy + height/3, sx, sy, radius);
        ctx.arcTo(sx, sy, sx + width/3, sy, radius);
        ctx.closePath();
        if (i === 0) {
            ctx.fill();
        } else {
            ctx.stroke();
        }
    }
}

function updateCube(canvas, map) {
    //const color = ['red', 'orange', 'blue', 'yellow', 'purple', 'green'];
    const color = ['#E71D36', '#ff5f2e', '#30A9DE', '#f9c00c', '#A593E0', '#56A902'];
    const index = [0, 2, 1, 5, 4, 3];
    for (let i = 0; i < 6; i++) {
        const ctx = canvas[i].getContext('2d');

        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) {
                drawCell(ctx, k, j, color[index[map[index[i]][j][k]]]);
            }
        }
    }
}
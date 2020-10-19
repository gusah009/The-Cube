import * as THREE from '/build/three.module.js';

import Stats from '/jsm/libs/stats.module.js';

import { TrackballControls } from '/jsm/controls/TrackballControls.js';
import { DragControls } from '/jsm/controls/DragControls.js';
import { STLLoader } from '/jsm/loaders/STLLoader.js';

const CELL_LENGTH = 1;


const geometry = RoundEdgedBox(CELL_LENGTH, CELL_LENGTH, CELL_LENGTH, CELL_LENGTH/6, 1, 1, 1, 2);
const faceColor = ['#E71D36', '#ff5f2e', '#30A9DE', '#f9c00c', '#A593E0', '#56A902', '#757575'];


class Cube3d {
	constructor(parent, backgroundColor, cube) {
        
            const THIS = this;
            this.parent = parent;
            this.cube = cube;
        
            this.scene;
            this.objects = [];
        
            this.camera;
            this.controls;
            this.renderer;
        
            let container, stats;
        

            let width = parent.clientWidth;
            let height = parent.clientHeight;
            let resizeTimer = false;

            this.camera = new THREE.PerspectiveCamera( 70, width / height, 1, 5000 );
            this.camera.position.x = 4;
            this.camera.position.y = 4;
            this.camera.position.z = 6;

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color( backgroundColor );

            this.scene.add( new THREE.AmbientLight( 0xA0A0A0 ) );

            let light = new THREE.SpotLight( 0xdddddd, 0.9 );
            light.position.set( this.camera.position.x, this.camera.position.y, this.camera.position.z );
            light.angle = Math.PI / 9;
            light.castShadow = true;
            this.scene.add( light );
        
            this.updateCube(geometry);


            this.renderer = new THREE.WebGLRenderer( { antialias: true } );
            this.renderer.setPixelRatio( window.devicePixelRatio );
            this.renderer.setSize( width, height );

            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFShadowMap;

            parent.appendChild( this.renderer.domElement );

            this.controls = new TrackballControls( this.camera, this.renderer.domElement );
            this.controls.rotateSpeed = 3.0;
            this.controls.zoomSpeed = 3.0;
            this.controls.panSpeed = 0.8;
            this.controls.noZoom = false;
            this.controls.noPan = true;
            this.controls.staticMoving = false;
            this.controls.dynamicDampingFactor = 0.5;
        
            this.setDragControls(this);
		
		
			let dragControls = new DragControls( THIS.objects, THIS.camera, THIS.renderer.domElement );
			dragControls.addEventListener( 'dragstart', function () {
				THIS.controls.enabled = false;
			} );
			dragControls.addEventListener( 'dragend', function () {
				THIS.controls.enabled = true;
			} );

            stats = new Stats();
            stats.dom.style.position = 'relative';
            parent.appendChild( stats.dom );

            animate();

            function animate() {
                requestAnimationFrame( animate );
                render();
            }

            function render() {
                THIS.controls.update();
                THIS.renderer.render( THIS.scene, THIS.camera );
                stats.update();
                resizeObserver();

                light.position.set( THIS.camera.position.x, THIS.camera.position.y, THIS.camera.position.z );
            }

            function resizeObserver() {
                if (width !== parent.clientWidth || height !== parent.clientHeight) {

                    width = parent.clientWidth;
                    height = parent.clientHeight;

                    if (resizeTimer === false) {
                        resizeTimer = setInterval(resizeRenderer, 1);            
                    }
                }
            }

            function resizeRenderer() {
                console.log('resize');
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();

                this.renderer.setSize( width, height);

                if (width === parent.clientWidth && height === parent.clientHeight) {
                    clearInterval(resizeTimer);
                    resizeTimer = false;
                }
            }
        
    }
    
    setDragControls(THIS) {



    }
    

    removeCube() {
        let THIS = this;
        this.objects.map(object => {
            this.scene.remove(object);
        });
        this.objects = [];
        
        THIS.setDragControls(THIS);
    }
    
    updateCube() {
        
        this.removeCube();
        
        for (let x=1; x<=3; x++) {
            for (let y=1; y<=3; y++) {
                for (let z=1; z<=3; z++) {
                    if (x == 1 || x == 3 || y == 1 || y == 3 || z == 1 || z == 3) {
                        
                        
                        let tmp;
                        if( z == 3 ) {
                            tmp = this.cube.map[2][mappingFaceY(2, x, y, z)][mappingFaceX(2, x, y, z)]
                        }
                        let materials = [
                            new THREE.MeshLambertMaterial({color:(z==3)?faceColor[tmp]:faceColor[6]}),
                            new THREE.MeshLambertMaterial({color:(z==1)?faceColor[4]:faceColor[6]}),
                            new THREE.MeshLambertMaterial({color:(x==3)?faceColor[3]:faceColor[6]}),
                            new THREE.MeshLambertMaterial({color:(x==1)?faceColor[1]:faceColor[6]}),
                            new THREE.MeshLambertMaterial({color:(y==3)?faceColor[0]:faceColor[6]}),
                            new THREE.MeshLambertMaterial({color:(y==1)?faceColor[5]:faceColor[6]}),
                        ];
                        let object = new THREE.Mesh( geometry, materials );

                        object.position.x = (x-2) * CELL_LENGTH;
                        object.position.y = (y-2) * CELL_LENGTH;
                        object.position.z = (z-2) * CELL_LENGTH;

                        object.castShadow = true;
                        object.receiveShadow = true;
                        
                        object.name = `${x}-${y}-${z}`;

                        this.scene.add( object );
                        this.objects.push( object );
                    }
                }
            }
        }
        
        
        function mappingFaceY(face, x, y, z) {
             switch (face) {
                 case 2:    return 3-y;    break;    
             }
            return 0;
        }
        function mappingFaceX(face, x, y, z) {
             switch (face) {
                 case 2:    return x-1;    break;
             }   
            return 0;
        }
        
    }
    
    // update Cube를 대신할 기능이 있어야 한다.
}


function RoundEdgedBox(w, h, d, r, wSegs, hSegs, dSegs, rSegs) {

    w = w || 1;
    h = h || 1;
    d = d || 1;
    let minimum = Math.min(Math.min(w, h), d);
    r = r || minimum * 0.25;
    r = r > minimum * 0.5 ? minimum * 0.5 : r;
    wSegs = Math.floor(wSegs) || 1;
    hSegs = Math.floor(hSegs) || 1;
    dSegs = Math.floor(dSegs) || 1;
    rSegs = Math.floor(rSegs) || 1;

    let fullGeometry = new THREE.BufferGeometry();

    let fullPosition = [];
    let fullUvs = [];
    let fullIndex = [];
    let fullIndexStart = 0;

    let groupStart = 0;

    bendedPlane(w, h, r, wSegs, hSegs, rSegs, d * 0.5, 'y', 0, 0);
    bendedPlane(w, h, r, wSegs, hSegs, rSegs, d * 0.5, 'y', Math.PI, 1);
    bendedPlane(d, h, r, dSegs, hSegs, rSegs, w * 0.5, 'y', Math.PI * 0.5, 2);
    bendedPlane(d, h, r, dSegs, hSegs, rSegs, w * 0.5, 'y', Math.PI * -0.5, 3);
    bendedPlane(w, d, r, wSegs, dSegs, rSegs, h * 0.5, 'x', Math.PI * -0.5, 4);
    bendedPlane(w, d, r, wSegs, dSegs, rSegs, h * 0.5, 'x', Math.PI * 0.5, 5);

    fullGeometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(fullPosition), 3));
    fullGeometry.addAttribute("uv", new THREE.BufferAttribute(new Float32Array(fullUvs), 2));
    fullGeometry.setIndex(fullIndex);

    fullGeometry.computeVertexNormals();

    return fullGeometry;

    function bendedPlane(width, height, radius, widthSegments, heightSegments, smoothness, offset, axis, angle, materialIndex) {

        let halfWidth = width * 0.5;
        let halfHeight = height * 0.5;
        let widthChunk = width / (widthSegments + smoothness * 2);
        let heightChunk = height / (heightSegments + smoothness * 2);

        let planeGeom = new THREE.PlaneBufferGeometry(width, height, widthSegments + smoothness * 2, heightSegments + smoothness * 2);

        let v = new THREE.Vector3(); // current vertex
        let cv = new THREE.Vector3(); // control vertex for bending
        let cd = new THREE.Vector3(); // vector for distance
        let position = planeGeom.attributes.position;
        let uv = planeGeom.attributes.uv;
        let widthShrinkLimit = widthChunk * smoothness;
        let widthShrinkRatio = radius / widthShrinkLimit;
        let heightShrinkLimit = heightChunk * smoothness;
        let heightShrinkRatio = radius / heightShrinkLimit;
        let widthInflateRatio = (halfWidth - radius) / (halfWidth - widthShrinkLimit);
        let heightInflateRatio = (halfHeight - radius) / (halfHeight - heightShrinkLimit);
        for (let i = 0; i < position.count; i++) {
            v.fromBufferAttribute(position, i);
            if (Math.abs(v.x) >= halfWidth - widthShrinkLimit) {
                v.setX((halfWidth - (halfWidth - Math.abs(v.x)) * widthShrinkRatio) * Math.sign(v.x));
            } else {
                v.x *= widthInflateRatio;
            } // lr
            if (Math.abs(v.y) >= halfHeight - heightShrinkLimit) {
                v.setY((halfHeight - (halfHeight - Math.abs(v.y)) * heightShrinkRatio) * Math.sign(v.y));
            } else {
                v.y *= heightInflateRatio;
            } // tb

            //re-calculation of uvs
            uv.setXY(
                i,
                (v.x - (-halfWidth)) / width,
                1 - (halfHeight - v.y) / height
            );


            // bending
            let widthExceeds = Math.abs(v.x) >= halfWidth - radius;
            let heightExceeds = Math.abs(v.y) >= halfHeight - radius;
            if (widthExceeds || heightExceeds) {
                cv.set(
                    widthExceeds ? (halfWidth - radius) * Math.sign(v.x) : v.x,
                    heightExceeds ? (halfHeight - radius) * Math.sign(v.y) : v.y,
                    -radius);
                cd.subVectors(v, cv).normalize();
                v.copy(cv).addScaledVector(cd, radius);
            }

            position.setXYZ(i, v.x, v.y, v.z);
        }

        planeGeom.translate(0, 0, offset);
        switch (axis) {
            case 'y':
                planeGeom.rotateY(angle);
                break;
            case 'x':
                planeGeom.rotateX(angle);
        }

        // merge positions
        position.array.forEach(function(p) {
            fullPosition.push(p);
        });

        // merge uvs
        uv.array.forEach(function(u) {
            fullUvs.push(u);
        });

        // merge indices
        planeGeom.index.array.forEach(function(a) {
            fullIndex.push(a + fullIndexStart);
        });
        fullIndexStart += position.count;

        // set the groups
        fullGeometry.addGroup(groupStart, planeGeom.index.count, materialIndex);
        groupStart += planeGeom.index.count;
    }
}

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
    
    const userCanvas = 1;
    const aiCanvas = 1;
    const etcCanvas = 1;
    
    updateCube(userCanvas, userCube.map);
    updateCube(aiCanvas, aiCube.map);
    updateCube(etcCanvas, etcCube.map);
    
    let userCube3d = new Cube3d(userBox, '#f4f5f9', userCube);
    let aiCube3d = new Cube3d(aiBox, '#c9d6de', aiCube);
    let etcCube3d = new Cube3d(etcBox, '#d4dfe6', etcCube);
    
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
            
            userCube3d.updateCube();//updateCube
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
        if (true || userCube.state === 'playing') {
            
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
           // solveAI(userCube, aiCube, aiCanvas);
            
            // ETC
            //solveReverse('etc', userCube, etcCube, etcCanvas, stack, 1000);
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
        sendAjax('http://ilscp3000.run.goorm.io/ai', JSON.stringify(data));
    }
    
    function sendAjax(url, data) {
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
                sendAjax('http://ilscp3000.run.goorm.io/ai', JSON.stringify(data));
            }
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

function updateCube(canvas, map) {
    
}
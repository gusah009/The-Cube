class Cube {
	constructor(name) {
        this.name = name;
		this.map = new Array(6);
		
		for (let i = 0; i < 6; i++) {
			this.map[i] = new Array(3);
			for (let j = 0; j < 3; j++) {
				this.map[i][j] = new Array(3);
				for (let k = 0; k < 3; k++) {
					this.map[i][j][k] = i;
				}
			}
		}
		this.checkMap();
	}
	
	printState() {
		console.log(this.state);
	}
	
	printMap() {
		console.log(JSON.parse(JSON.stringify(this.map)));
	}
	
	/*
	   U0
	L1 F2 R3 B4
	   D5
	*/
    
    countRotation(face, dir, count) {
        for (let i = 0; i < count; i++) {
            this.rotation(face, dir);   
        }
    }
    
	rotation(face, dir) {
		const mapping = {
			U: {
				fn: 0, //fn > face number
				join : [
					{face: 'B', col: false, ln: 0},  // U ln > line number
					{face: 'R', col: false, ln: 0},  // R
					{face: 'F', col: false, ln: 0},  // D
					{face: 'L', col: false, ln: 0}   // L
				]
			},
			F: {
				fn: 1,//2, //fn > face number
				join : [
					{face: 'U', col: false, ln: 2},  // U ln > line number
					{face: 'R', col: true,  ln: 0},  // R
					{face: 'D', col: false, ln: 0},  // D
					{face: 'L', col: true,  ln: 2}   // L
				]
			},
			L: {
				fn: 2, //1, //fn > face number
				join : [
					{face: 'U', col: true, ln: 0},  // U ln > line number
					{face: 'F', col: true, ln: 0},  // R
					{face: 'D', col: true, ln: 0},  // D
					{face: 'B', col: true, ln: 2}   // L
				]
			},
			D: {
				fn: 3, //5, //fn > face number
				join : [
					{face: 'F', col: false, ln: 2},  // U ln > line number
					{face: 'R', col: false, ln: 2},  // R
					{face: 'B', col: false, ln: 2},  // D
					{face: 'L', col: false, ln: 2}   // L
				]
			},
			B: {
				fn: 4, //fn > face number
				join : [
					{face: 'U', col: false, ln: 0},  // U ln > line number
					{face: 'L', col: true,  ln: 0},  // R
					{face: 'D', col: false, ln: 2},  // D
					{face: 'R', col: true,  ln: 2}   // L
				]
			},
			R: {
				fn: 5, //3, //fn > face number
				join : [
					{face: 'U', col: true, ln: 2},  // U ln > line number
					{face: 'B', col: true, ln: 0},  // R
					{face: 'D', col: true, ln: 2},  // D
					{face: 'F', col: true, ln: 2}   // L
				]
			},
		};
		
		const innerIndex = {
			R: [[6,8,2], [3,7,5]],
			L: [[2,8,6], [5,7,3]]
		};
		const innerBuffer = [this.map[mapping[face].fn][0][0], this.map[mapping[face].fn][0][1]];
		let oldIndex = [0, 1];
		
		for (let i = 0; i < 2; i++) {
			for (let j = 0; j < 3; j++) {
				const index = innerIndex[dir][i][j];
				
				this.map[mapping[face].fn][Math.floor(oldIndex[i]/3)][oldIndex[i]%3] = this.map[mapping[face].fn][Math.floor(index/3)][index%3];
				oldIndex[i] = index;
			}
			this.map[mapping[face].fn][Math.floor(oldIndex[i]/3)][oldIndex[i]%3] = innerBuffer[i];
		}
		
		let joinFace = mapping[face].join[0];
		let nextFace, reverseFlag;
		const outerBuffer = this.getMap(mapping[joinFace.face].fn, joinFace.col, joinFace.ln);
		oldIndex = 0;
		
		for (let i = 1; i <= 3; i++) {
			const index = (dir === 'R')? 4 - i: i;
			
			joinFace = mapping[face].join[oldIndex];
			nextFace = mapping[face].join[index];
			reverseFlag = (joinFace.col === nextFace.col) ^ (joinFace.ln === nextFace.ln);
			const nextData = this.getMap(mapping[nextFace.face].fn, nextFace.col, nextFace.ln);
			this.setMap(mapping[joinFace.face].fn, joinFace.col, joinFace.ln, nextData, reverseFlag);
			
			oldIndex = index;
		}
		
		joinFace = mapping[face].join[oldIndex];
		nextFace = mapping[face].join[0];
		reverseFlag = (joinFace.col === nextFace.col) ^ (joinFace.ln === nextFace.ln);
		this.setMap(mapping[joinFace.face].fn, joinFace.col, joinFace.ln, outerBuffer, reverseFlag);
		
		this.checkMap();
	}
	
	getMap(fn, col, ln) {
		let result = [];
		if (col === true) {
			for (let i = 0; i < 3; i++) {
				result.push(this.map[fn][i][ln]);
			}
		} else {
			result = JSON.parse(JSON.stringify(this.map[fn][ln]));
		}
		return result;
	}
	
	setMap(fn, col, ln, data, reverseFlag) {
		if (reverseFlag) {
			data.reverse();
		}
		if ( col === true) {
			for (let i = 0; i < 3; i++) {
				this.map[fn][i][ln] = data[i];
			}
		} else {
			this.map[fn][ln] = JSON.parse(JSON.stringify(data));
		}
	}
	
	checkMap() {
		let flag = true;
		check: for (let i = 0; i < 6; i++) {
			for (let j = 0; j < 3; j++) {
				for (let k = 0; k <3; k++) {
					if (this.map[i][j][k] !== i) {
						flag = false;
						break check;
					}
				}
			}
		}
		if (flag === true) {
			this.state = 'complete';
			console.log(this.name, 'Cube is solved');
		} else {
			this.state = 'playing';
		}
	}
	
	test() {
		// Write File
		// ASync
		var data = "Welcome to my blog.";
		fs.writeFile('./output.txt', data ,'utf8', function(error, data){
		if (error) {throw error;}
		console.log("ASync Write Complete");
		});
 		// Sync
		//fs.writeFileSync('WriteSync.txt', data, 'utf8');
		//console.log("Sync Write Complete");
	}
}
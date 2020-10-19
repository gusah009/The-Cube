const fs = require('fs');
const express = require('express');
const app = express();
    
const {PythonShell} = require('python-shell');
const pyshell = new PythonShell('public/PY/no_network_solve/test_2phase.py');

app.use(express.static('public'));
app.use(express.json());

let RES;
let count = 0;

pyshell.on('message', function (message) {
	console.log(message);
    RES.send(message);
});

app.post('/ai', (req, res) => {
    RES = res;
	console.log(req.body.cubeData);
	pyshell.send(req.body.cubeData);
});

app.listen(3000, () => {
    console.log('Server is running!');
});
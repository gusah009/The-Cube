import os
import numpy as np

os.chdir('/workspace/THE_CUBE/public/PY/no_network_solve')

while True:
	import solver

	cube_input = input()

	cube_complete = []
	answer_send = []

	cube_input = cube_input.split(',')
	cube = cube_input[0:9] + cube_input[45:54] + cube_input[9:18] + cube_input[27:36] + cube_input[18:27] + cube_input[36:45]

	cube_face = ['U', 'F', 'L', 'D', 'B', 'R']
	for i in range(54):
		for j in range(len(cube_face)):
			if j == int(cube[i]):
				cube_complete.append(cube_face[j])

	cube_complete = ''.join(cube_complete)
	answer = solver.solve(cube_complete).split(' ')
	answer.pop()

	for i in range(len(answer)):

		rot_face = ''
		rot_dir = ''

		for j in range(len(cube_face)):
			if cube_face[j] ==  answer[i][0]:
				rot_face = str(j);

		if answer[i][1] == '1':
			rot_dir = ' 0'
		else:
			rot_dir = ' 1'

		answer_send.append(rot_face + rot_dir)
		if answer[i][1] == '2':
			answer_send.append(rot_face + rot_dir)

	print(answer_send)
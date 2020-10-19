import tensorflow as tf
import numpy as np
import sys
import os
#WARNING 무시하는 6줄짜리 코드
if type(tf.contrib) != type(tf): tf.contrib._warning = None
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
old_v = tf.compat.v1.logging.get_verbosity()
tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)
import warnings
warnings.simplefilter("ignore")

jit_scope = tf.contrib.compiler.jit.experimental_jit_scope
data_many = 1

X = tf.compat.v1.placeholder(tf.float32, [None,6*3*3])
Y1 = tf.compat.v1.placeholder(tf.float32, [None,6])
Y2 = tf.compat.v1.placeholder(tf.float32, [None,2])
with jit_scope():
	W11 = tf.Variable(tf.random.normal([6*3*3,144], stddev=0.01))
	b11 = tf.Variable(tf.zeros([144]))
	A11 = tf.nn.relu(tf.add(tf.matmul(X,W11),b11))

	W12 = tf.Variable(tf.random.normal([144,288], stddev=0.01))
	b12 = tf.Variable(tf.zeros([288]))
	A12 = tf.nn.relu(tf.add(tf.matmul(A11,W12),b12))

	W13 = tf.Variable(tf.random.normal([288,819], stddev=0.01))
	b13 = tf.Variable(tf.zeros([819]))
	A13 = tf.nn.relu(tf.add(tf.matmul(A12,W13),b13))

	W14 = tf.Variable(tf.random.normal([819,324], stddev=0.01))
	b14 = tf.Variable(tf.zeros([324]))
	A14 = tf.nn.relu(tf.add(tf.matmul(A13,W14),b14))

	W15 = tf.Variable(tf.random.normal([324,627], stddev=0.01))
	b15 = tf.Variable(tf.zeros([627]))
	A15 = tf.nn.relu(tf.add(tf.matmul(A14,W15),b15))

	W16 = tf.Variable(tf.random.normal([627,6], stddev=0.01))
	b16 = tf.Variable(tf.zeros([6]))
	model1 = tf.add(tf.matmul(A15,W16),b16)

	cost = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits_v2(labels = Y1, logits = model1))
	optimizer = tf.compat.v1.train.AdamOptimizer(learning_rate = 0.0001).minimize(cost)

	W21 = tf.Variable(tf.random.normal([6*3*3,144], stddev=0.01))
	b21 = tf.Variable(tf.zeros([144]))
	A21 = tf.nn.relu(tf.add(tf.matmul(X,W21),b21))

	W22 = tf.Variable(tf.random.normal([144,288], stddev=0.01))
	b22 = tf.Variable(tf.zeros([288]))
	A22 = tf.nn.relu(tf.add(tf.matmul(A21,W22),b22))

	W23 = tf.Variable(tf.random.normal([288,2], stddev=0.01))
	b23 = tf.Variable(tf.zeros([2]))
	model2 = tf.add(tf.matmul(A22,W23),b23)

	cost2 = tf.reduce_mean(tf.nn.softmax_cross_entropy_with_logits_v2(labels = Y2, logits = model2))
	optimizer2 = tf.compat.v1.train.AdamOptimizer(learning_rate = 0.0001).minimize(cost2)

	sess = tf.compat.v1.Session()

	saver = tf.compat.v1.train.Saver()

	#ckpt는 checkpoint임
	ckpt = tf.train.get_checkpoint_state('/workspace/THE_CUBE/public/PY/model')
	saver.restore(sess, ckpt.model_checkpoint_path)
	while True:
		lines1 = input()
		lines1 = lines1.split('\n')
		lines1 = " ".join(lines1)
		lines1 = lines1.split(" ")
		#lines = lines.split(',')
		#lines = " ".join(lines)
		#lines = np.array(lines)
		tmp1 = np.arange(54*data_many)
		tmp1 = tmp1.reshape(data_many,54)
		for i in range(data_many):
			for j in range(54):
				tmp1[i][j] = float((lines1[i].split(','))[j])
		face = np.argmax(sess.run(model1[0], feed_dict={X:tmp1}))
		dir = np.argmax(sess.run(model2[0], feed_dict={X:tmp1}))
		print(face, dir)
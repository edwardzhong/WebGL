	precision mediump float; // 精度限定
	uniform vec4 u_FragColor;  // 限定符，类型，变量名称: uniform变量，不能使用attribute变量
	void main() {
		gl_FragColor = u_FragColor;
	}

	attribute vec4 a_Position; //限定符，类型，变量名称：顶点，attribute变量传输与顶点有关的数据，表示逐顶点的信息(顶点依次传递给它的意思) 
	uniform vec4 u_Translation; //位移, uniform变量传输的是所有顶点(或与顶点无关)都相同的数据(各顶点或片元共用的数据，比如矩阵变换), 可以是除了数组和结构体外的任意类型
	uniform float u_Angle;
	// attribute float a_PositionSize;
	void main() { 
		float deg=radians(u_Angle);
		float sinB=sin(deg);
		float cosB=cos(deg);
		gl_Position.x = a_Position.x*cosB - a_Position.y*sinB;
		gl_Position.y = a_Position.x*sinB + a_Position.y*cosB;
		gl_Position.z = a_Position.z;
		gl_Position.w = 1.0;
		gl_Position = a_Position + u_Translation; 
		// gl_PointSize = a_PositionSize; 
	} 

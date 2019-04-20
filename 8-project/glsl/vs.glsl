attribute vec4 a_position;//顶点位置
attribute vec4 a_color;//顶点颜色
attribute vec4 a_scolor;//顶点高光颜色
attribute vec4 a_normal;//法向量
uniform mat4 u_MvpMatrix;//mvp矩阵
uniform mat4 u_ModelMatrix;//模型矩阵
uniform mat4 u_NormalMatrix;
varying vec4 v_Color;
varying vec4 v_Scolor;
varying vec3 v_Normal;
varying vec3 v_Position;

void main() {
    gl_Position = u_MvpMatrix * a_position;
    // 计算顶点在世界坐标系的位置，以便计算点光源在顶点处点位置
    v_Position = vec3(u_ModelMatrix * a_position);
    // 计算变换后的法向量
    v_Normal = vec3(u_NormalMatrix * a_normal);
    v_Color = a_color;
    v_Scolor = a_scolor;
}

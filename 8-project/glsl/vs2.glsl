attribute vec4 a_position;//顶点位置
attribute vec4 a_color;//顶点颜色
attribute vec4 a_scolor;//顶点高光颜色
attribute vec4 a_normal;//法向量
uniform mat4 u_vpMatrix;//mvp矩阵
uniform mat4 u_vpMatrixFromLight;//光源处观察的模型视图投影矩阵
uniform mat4 u_modelMatrix;//模型矩阵
uniform mat4 u_normalMatrix;
varying vec4 v_Color;
varying vec4 v_Scolor;
varying vec3 v_Normal;
varying vec3 v_Position;
varying vec4 v_PositionFromLight;

void main() {
    gl_Position = u_vpMatrix * u_modelMatrix * a_position;
    // 计算顶点在世界坐标系的位置，以便计算点光源在顶点处点位置
    v_Position = vec3(u_modelMatrix * a_position);
    //光源处观察到的坐标,用于后续分解出z值
    v_PositionFromLight = u_vpMatrixFromLight * u_modelMatrix * a_position;
    // 计算变换后的法向量
    v_Normal = vec3(u_normalMatrix * a_normal);
    v_Color = a_color;
    v_Scolor = a_scolor;
}

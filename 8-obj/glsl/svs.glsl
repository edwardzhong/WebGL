attribute vec4 a_position; 
uniform mat4 u_vpMatrix; 
uniform mat4 u_modelMatrix;

void main() { 
    gl_Position = u_vpMatrix * u_modelMatrix * a_position; 
}
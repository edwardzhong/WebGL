#ifdef GL_ES
precision mediump float;
#endif
uniform vec3 u_LightPosition;//光源位置
uniform vec3 u_diffuseColor;//漫反射光颜色
uniform vec3 u_AmbientColor;//环境光颜色
uniform vec3 u_specularColor;//镜面反射光颜色
uniform float u_Shininess;// 镜面反射光泽度
uniform vec3 u_viewPosition;// 视点位置
varying vec3 v_Normal;//法向量
varying vec3 v_Position;//顶点位置
varying vec4 v_Color;//顶点颜色
varying vec4 v_Scolor;//顶点高光颜色

void main() {
    // 对法线归一化，因为其内插之后长度不一定是1
    vec3 normal = normalize(v_Normal);
    // 计算光线方向(光源位置-顶点位置)并归一化
    // vec3 lightDirection = normalize(u_LightPosition - v_Position);
    // 平行光
    vec3 lightDirection = normalize(u_LightPosition);
    // 计算光线方向和法向量点积
    float nDotL = max(dot(lightDirection, normal), 0.0);
    // 漫反射光亮度
    vec3 diffuse = u_diffuseColor  * nDotL * v_Color.rgb;
    // 环境光亮度
    vec3 ambient = u_AmbientColor * v_Color.rgb;
    // gl_FragColor = vec4(diffuse + ambient, v_Color.a);

    // 观察方向的单位向量V
    vec3 eyeDirection = normalize(u_viewPosition - v_Position.xyz);// 反射方向
    // 反射方向
    vec3 reflectionDirection = reflect(-lightDirection, normal);
    // 镜面反射亮度权重
    float specularWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), u_Shininess);
    vec3 specular =  u_specularColor.rgb * specularWeighting;
    gl_FragColor = vec4(ambient + diffuse + specular, v_Color.a);
}


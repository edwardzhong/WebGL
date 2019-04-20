#ifdef GL_ES
precision mediump float;
#endif
uniform vec3 u_lightPosition;//光源位置
uniform vec3 u_diffuseColor;//漫反射光颜色
uniform vec3 u_ambientColor;//环境光颜色
uniform vec3 u_specularColor;//镜面反射光颜色
uniform float u_shininess;// 镜面反射光泽度
uniform vec3 u_viewPosition;// 视点位置
uniform int u_ref;//是否反射
uniform sampler2D u_shadowMap;

varying vec3 v_Normal;//法向量
varying vec3 v_Position;//顶点位置
varying vec4 v_PositionFromLight;
varying vec4 v_Color;//顶点颜色
varying vec4 v_Scolor;//顶点高光颜色

/**
* 释出深度值z
*/
float unpack(const in vec4 rgbaDepth) {
    const vec4 bitShift = vec4(1.0, 1.0/256.0, 1.0/(256.0*256.0), 1.0/(256.0*256.0*256.0));
    return dot(rgbaDepth, bitShift);
}

void main() {
    // 对法线归一化，因为其内插之后长度不一定是1
    vec3 normal = normalize(v_Normal);
    // 计算光线方向(光源位置-顶点位置)并归一化
    // vec3 lightDirection = normalize(u_lightPosition - v_Position);
    // 平行光
    vec3 lightDirection = normalize(u_lightPosition);
    // 计算光线方向和法向量点积(夹角的余弦值:90deg为与平面平行,0deg为与平面垂直)
    float cosTheta = max(dot(lightDirection, normal), 0.0);
    // 漫反射光亮度
    vec3 diffuse = u_diffuseColor * v_Color.rgb * cosTheta;
    // 环境光亮度
    vec3 ambient = u_ambientColor * v_Color.rgb;
    // gl_FragColor = vec4(diffuse + ambient, v_Color.a);

    vec3 specular = vec3(0.0,0.0,0.0);
    if(u_ref == 1){
        // 观察方向的单位向量V
        vec3 viewDirection = normalize(u_viewPosition - v_Position.xyz);// 反射方向
        // 反射方向
        vec3 reflectionDirection = reflect(-lightDirection, normal);
        // 镜面反射亮度权重
        float specularWeighting = pow(max(dot(reflectionDirection, viewDirection), 0.0), u_shininess);
        specular =  u_specularColor.rgb * specularWeighting;
    }
    
    /**
    * 阴影部分
    */
    float bias = 0.005*tan(acos(cosTheta));// 根据光线与表面的夹角计算偏移量,用于消除马赫带
    bias = clamp(bias, 0.0015,0.01);

    // 因为阴影纹理坐标和该坐标(光源处观察到的坐标),视点都是在光源处(使用的都是光源处的mvp矩阵);
    // 所以使用该坐标计算出的就是纹理的坐标, 再通过纹理坐标就能找到光源处对应的z值
    // xy将坐标区间从[-1,1]转为gl_FragCoord的区间[0,1],z是求出gl_FragCoord的深度值z(与后面的纹理z比较),刚好它们的求值方式都是一样
    vec3 shadowCoord = (v_PositionFromLight.xyz/v_PositionFromLight.w)/2.0 + 0.5;
    // vec4 rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy);// 获取指定纹理坐标处的像素颜色rgba
    // float depth = unpack(rgbaDepth); //将纹理颜色值(gl_fragColor)解析出阴影深度值z(光源视点)
    // float visibility = (shadowCoord.z > depth + bias) ? 0.1 : 1.0;//大于阴影的z轴,说明在阴影中并显示为阴影*0.6,否则为正常颜色*1.0
    
    // pcf 消除阴影边缘的锯齿
    float shadows =0.0;
    float opacity=0.3;// 阴影alpha值, 值越小暗度越深
    float texelSize=1.0/1024.0;// 阴影像素尺寸,值越小阴影越逼真
    vec4 rgbaDepth;

    for(float y=-1.5; y <= 1.5; y += 1.0){
        for(float x=-1.5; x <=1.5; x += 1.0){
            rgbaDepth = texture2D(u_shadowMap, shadowCoord.xy+vec2(x,y)*texelSize);
            shadows += shadowCoord.z-bias > unpack(rgbaDepth) ? 1.0 : 0.0;
        }
    }
    shadows/=16.0;
    float visibility=min(opacity+(1.0-shadows),1.0);
    // visibility=visibility>0.8?1.0:visibility;
    specular=visibility < 1.0 ? vec3(0.0,0.0,0.0): specular;// 阴影处没有高光
    gl_FragColor = vec4((diffuse + ambient + specular) * visibility, v_Color.a);
    // gl_FragColor = vec4(ambient + diffuse + specular, v_Color.a);
}


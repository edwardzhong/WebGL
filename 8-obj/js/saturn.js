import { get3DContext, createProgramInfo, createBufferInfoFromArrays, setBuffersAndAttributes, setUniforms,initFramebufferObject } from '../lib/graphics/webgl-util.js';
import { OBJDoc } from '../lib/graphics/objParse.js';
import { Matrix4 } from '../lib/graphics/matrix.js';
require('../lib/graphics/util.js');
require('../lib/graphics/polygon.js');

var canvas = document.getElementById('canvas'),
    gl = get3DContext(canvas, true),
    objElem = document.getElementById('tplObj'),
    mtlElem = document.getElementById('tplMtl'),
    angleX = 0,
    angleY = 0,
    angleZ = 0,
    viewAngleX = 0,
    viewAngleY = 0,
    cViewAngleX = 0,
    cViewAngleY = 0,
    viewLEN = 55,
    LENPERCENT = 1,
    LIGHT_POS = [100.0, 20.0, 10.0],
    CENTER = { x: canvas.width / 2, y: canvas.height / 2 },
    START = {};

function main() {
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    var program = createProgramInfo(gl, ['vs', 'fs']),
        shadowProgram = createProgramInfo(gl, ['svs', 'sfs']),
        buffers = [], buffer = null, rings = [],
        sphereBuffer = createBufferInfoFromArrays(gl, Sphere(40, [0.8, 0.7, 0.2, 1.0], 25));

    // 分析模型字符串
    var doc = new OBJDoc('rings', objElem.text, mtlElem.text);
    if (!doc.parse(1, true)) { return; }
    doc.getDrawingInfo().forEach(item => {
        buffers.push(createBufferInfoFromArrays(gl, {
            position: item.vertices,
            normal: item.normals,
            color: item.colors,
            scolor: item.scolors,
            indices: item.indices
        }));
    });

    for (var i = 0; i < 1080; i++) {
        rings.push({
            r: Random(30, 50),
            deg: i % 360,
            spd: Random(0.2, 2)
        });
        rings.push({
            r: Random(35, 45),
            deg: (i + 1) % 360,
            spd: Random(0.2, 2)
        });
    }

    // 初始化帧缓冲区对象 (FBO)  
    var fbo = initFramebufferObject(gl);
    if (!fbo) {
        console.log('Failed to initialize frame buffer object');
        return;
    }
    // 激活0号纹理单元,并将纹理对象绑定到该单元
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, fbo.texture);

    // 设置背景颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 开启隐藏面消除
    gl.enable(gl.DEPTH_TEST);
    // 设置支持透明
    gl.enable(gl.BLEND);
    // 设置混合函数, 会导致阴影失效
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var modelMatrix = new Matrix4(),
        normalMatrix = new Matrix4(),
        vpMatrix = new Matrix4(),
        vpMatrixFromLight = new Matrix4(),
        last = Date.now(), now = last, elapsed = 0;

    // 光影处的视点投影矩阵    
    vpMatrixFromLight.setPerspective(50, canvas.width / canvas.height, 1, 300);
    vpMatrixFromLight.lookAt(...LIGHT_POS, 0, 0, 0, 0, 1, 0);
    
    (function animate() {
        var angleX = (viewAngleX + cViewAngleX) % 360,
            angleY = viewAngleY + cViewAngleY,
            len = viewLEN * LENPERCENT;

        angleY = angleY > 45 ? 45 : angleY < 5 ? 5 : angleY;
        len = len > 70 ? 70 : len < 30 ? 30 : len;

        var eyeY = len * Math.sin(angleY * Math.PI / 180),
            c = len * Math.cos(angleY * Math.PI / 180),
            eyeX = c * Math.sin(angleX * Math.PI / 180),
            eyeZ = c * Math.cos(angleX * Math.PI / 180);

        // 视点投影矩阵
        vpMatrix.setPerspective(50, canvas.width / canvas.height, 1, 300);
        vpMatrix.lookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0);

        now = new Date();
        elapsed = now - last;
        last = now;

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); // 切换绘制场景为帧缓冲区  
        gl.viewport(0, 0, 1024,1024); //设置绘图区域
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear FBO  

        /* 
         * 阴影着色器
         */    
        gl.useProgram(shadowProgram.program);
        modelMatrix.setIdentity();
        setBuffersAndAttributes(gl,shadowProgram,sphereBuffer);
        setUniforms(shadowProgram,{
            u_vpMatrix: vpMatrixFromLight.elements,
            u_modelMatrix:modelMatrix.elements
        });
        gl.drawElements(gl.TRIANGLES, sphereBuffer.numElements, sphereBuffer.indexType, 0);

        rings.forEach((pos, i) => {
            // 模型矩阵
            pos.deg += pos.spd * elapsed / 1000;
            pos.deg %= 360;
            modelMatrix.setRotate(pos.deg, 0, 1, 0);
            modelMatrix.translate(pos.r, 0, 0);
            buffer = buffers[i % buffers.length];

            setBuffersAndAttributes(gl, shadowProgram, buffer);
            setUniforms(shadowProgram, { 
                u_vpMatrix:vpMatrixFromLight.elements,
                u_modelMatrix:modelMatrix.elements
            });
            gl.drawElements(gl.TRIANGLES, buffer.numElements, buffer.indexType, 0);
        });


        // 将帧缓冲区切换为正常的缓冲区
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);//设置绘图区域
        // 清屏|清深度缓冲
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        /*
         * 正常着色器
         */
        gl.useProgram(program.program);
        setUniforms(program, {
            u_vpMatrixFromLight:vpMatrixFromLight.elements,
            u_vpMatrix:vpMatrix.elements,
            u_shadowMap: 0,
            u_lightPosition: LIGHT_POS,
            u_viewPosition: [eyeX, eyeY, eyeZ],
            u_diffuseColor: [1.0, 1.0, 1.0],
            u_ambientColor: [0.5, 0.5, 0.5],
            u_specularColor: [1, 1, 1],
            u_shininess: 100
        });

        modelMatrix.setIdentity();
        // 根据模型矩阵计算用来变换法向量的矩阵
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();

        setBuffersAndAttributes(gl, program, sphereBuffer);
        setUniforms(program, {
            u_ref: 0,
            u_modelMatrix: modelMatrix.elements,
            u_normalMatrix: normalMatrix.elements
        });

        gl.drawElements(gl.TRIANGLES, sphereBuffer.numElements, sphereBuffer.indexType, 0);

        rings.forEach((pos, i) => {
            // 模型矩阵
            // pos.deg += pos.spd * elapsed / 1000;
            // pos.deg %= 360;
            modelMatrix.setRotate(pos.deg, 0, 1, 0);
            modelMatrix.translate(pos.r, 0, 0);
            // 根据模型矩阵计算用来变换法向量的矩阵
            normalMatrix.setInverseOf(modelMatrix);
            normalMatrix.transpose();
            buffer = buffers[i % buffers.length];

            setBuffersAndAttributes(gl, program, buffer);
            setUniforms(program, {
                u_ref: 1,
                u_modelMatrix: modelMatrix.elements,
                u_normalMatrix: normalMatrix.elements
            });

            gl.drawElements(gl.TRIANGLES, buffer.numElements, buffer.indexType, 0);
        });

        requestAnimationFrame(animate);
    }());
}


canvas.addEventListener('mousedown', function (e) {
    START = WindowToCanvas(canvas, e.clientX, e.clientY);
    canvas.addEventListener('mousemove', mouseMove, false);
    canvas.addEventListener('mouseup', mouseUp, false);
}, false);

function mouseMove(e) {
    var end = WindowToCanvas(canvas, e.clientX, e.clientY),
        a = Math.sqrt(Math.pow(START.x - CENTER.x, 2) + Math.pow(START.y - CENTER.y, 2)),
        b = Math.sqrt(Math.pow(end.x - CENTER.x, 2) + Math.pow(end.y - CENTER.y, 2)),
        radX = (START.x - end.x) * 0.01,
        radY = (end.y - START.y) * 0.01;

    cViewAngleX = radX * 180 / Math.PI;
    cViewAngleY = radY * 180 / Math.PI;
    cViewAngleY > 90 ? 90 : cViewAngleY < -90 ? -90 : cViewAngleY;
    LENPERCENT = b / a;
}

function mouseUp(e) {
    viewAngleX += cViewAngleX;
    cViewAngleX = 0;
    viewAngleY += cViewAngleY;
    cViewAngleY = 0;
    viewLEN *= LENPERCENT;
    LENPERCENT = 1;
    canvas.removeEventListener('mousemove', mouseMove, false);
    canvas.removeEventListener('mouseup', mouseUp, false);
}

main();

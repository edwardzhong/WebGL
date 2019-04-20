import {get3DContext,createProgramInfo,createBufferInfoFromArrays,setBuffersAndAttributes,setUniforms} from '../lib/graphics/webgl-util.js';
import {OBJDoc} from '../lib/graphics/objParse.js';
import {Matrix4} from '../lib/graphics/matrix.js';
require('../lib/graphics/util.js');

var canvas = document.getElementById('canvas'),
    gl = get3DContext(canvas, true),
    objElem = document.getElementById('tplObj'),
    mtlElem = document.getElementById('tplMtl'),
    buffer=null,
    notMan=true,
    angleX = 0,
    angleY = 0,
    angleZ = 0,
    viewAngleX=0,
    viewAngleY=0,
    cViewAngleX = 0,
    cViewAngleY = 0,
    viewLEN=30,
    LENPERCENT = 1,
    CENTER = { x: canvas.width / 2, y: canvas.height / 2 },
    START = {};

function main() {
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    var program = createProgramInfo(gl, ['vs', 'fs']);
    var buffers=[];

    // 分析模型字符串
    var objDoc = new OBJDoc('room',objElem.text,mtlElem.text);
    if(!objDoc.parse(1, true)){return;}
    var drawingInfos = objDoc.getDrawingInfo();
    // buffer=createBufferInfoFromArrays(gl, {
    //     position:drawingInfos.vertices,
    //     normal:drawingInfos.normals,
    //     color:drawingInfos.colors,
    //     scolor:drawingInfos.scolors,
    //     indices:drawingInfos.indices
    // });
    drawingInfos.forEach(function(item,i){
        buffers.push(createBufferInfoFromArrays(gl, {
            position:item.vertices,
            normal:item.normals,
            color:item.colors,
            scolor:item.scolors,
            indices:item.indices
        }));
    });
    


    // 设置背景颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 开启隐藏面消除
    gl.enable(gl.DEPTH_TEST);
    // 设置支持透明
    gl.enable (gl.BLEND);
    // 设置混合函数
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.viewport(0, 0, canvas.width, canvas.height); //设置绘图区域

    gl.useProgram(program.program);

    setUniforms(program, {
        u_LightPosition: [5.0, -1.5, 3.0],
        u_diffuseColor: [1.0, 1.0, 1.0],
        u_AmbientColor: [0.5, 0.5, 0.5],
        u_specularColor: [1,1,1],
        u_Shininess: 100
    });


    var modelMatrix = new Matrix4();
    var mvpMatrix = new Matrix4();
    var normalMatrix = new Matrix4();

    (function animate() {
        if(notMan){
            cViewAngleX+=0.5;
            if(cViewAngleY<40){
                cViewAngleY+=0.1;
            }

            if(viewLEN>3.7){
                viewLEN-=0.05;
            }
        }
        var angleX = (viewAngleX + cViewAngleX) % 360,
            angleY = viewAngleY + cViewAngleY,
            len = viewLEN * LENPERCENT;

        angleY = angleY > 90 ? 90 : angleY < 10 ? 10 : angleY;
        len = len > 6 ? 6 : len < 2 ? 2 : len;

        var eyeY = len * Math.sin(angleY * Math.PI / 180),
            c = len * Math.cos(angleY * Math.PI / 180),
            eyeX = c * Math.sin(angleX * Math.PI / 180),
            eyeZ = c * Math.cos(angleX * Math.PI / 180);
        // 模型矩阵
        modelMatrix.setRotate(0, 1, 0, 0);
        // 视点投影
        mvpMatrix.setPerspective(45, canvas.width / canvas.height, 1, 300);
        mvpMatrix.lookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, (viewAngleY>90||viewAngleY<-90)?-1:1, 0);
        mvpMatrix.multiply(modelMatrix);
        // 根据模型矩阵计算用来变换法向量的矩阵
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();

        // 清屏|清深度缓冲
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        setUniforms(program, {
            u_viewPosition:[eyeX,eyeY,eyeZ],
            u_ModelMatrix: modelMatrix.elements,
            u_MvpMatrix: mvpMatrix.elements,
            u_NormalMatrix: normalMatrix.elements
        });

        drawingInfos.forEach((polygon, i) => {
            buffer = buffers[i % buffers.length];
            setBuffersAndAttributes(gl, program, buffer);
            gl.drawElements(gl.TRIANGLES, buffer.numElements, buffer.indexType, 0);
        });

        requestAnimationFrame(animate);
    }());
}

canvas.addEventListener('mousedown', function(e) {
    notMan=false;
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

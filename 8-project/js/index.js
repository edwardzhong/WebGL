import {get3DContext,createProgramInfo,createBufferInfoFromArrays,setBuffersAndAttributes,setUniforms} from '../lib/graphics/webgl-util.js';
import {OBJDoc} from '../lib/graphics/objParse.js';
import {Matrix4} from '../lib/graphics/matrix.js';

var canvas = document.getElementById('canvas'),
    gl = get3DContext(canvas, true),
    objElem = document.getElementById('tplObj'),
    mtlElem = document.getElementById('tplMtl'),
    buffer=null,
    notMan=true,
    angleX = 0,
    angleY = 0,
    angleZ = 0,
    viewAngleX=30,
    viewAngleY=45,
    viewLEN=15;

function main() {
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    var program = createProgramInfo(gl, ['vs', 'fs']);
    var buffers=[];

    // 分析模型字符串
    var objDoc = new OBJDoc('plane',objElem.text,mtlElem.text);
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
        u_LightPosition: [0.0, 2.0, 12.0],
        u_diffuseColor: [1.0, 1.0, 1.0],
        u_AmbientColor: [0.5, 0.5, 0.5],
        u_specularColor: [1,1,1],
        u_Shininess: 100
    });


    var modelMatrix = new Matrix4();
    var mvpMatrix = new Matrix4();
    var normalMatrix = new Matrix4();

    (function animate() {
        // 模型矩阵
        if(notMan){ angleY+=0.5; }
        modelMatrix.setRotate(angleY % 360, 0, 1, 0); // 绕y轴旋转
        modelMatrix.rotate(angleX % 360, 1, 0, 0); // 绕x轴旋转
        modelMatrix.rotate(angleZ % 360, 0, 0, 1); // 绕z轴旋转

        var eyeY=viewLEN*Math.sin(viewAngleY*Math.PI/180),
            len=viewLEN*Math.cos(viewAngleY*Math.PI/180),
            eyeX=len*Math.sin(viewAngleX*Math.PI/180),
            eyeZ=len*Math.cos(viewAngleX*Math.PI/180);

        // gl.uniform3f(u_viewPosition, eyeX,eyeY,eyeZ);
        // 视点投影
        mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 300);
        mvpMatrix.lookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, (viewAngleY>90||viewAngleY<-90)?-1:1, 0);
        mvpMatrix.multiply(modelMatrix);
        // 根据模型矩阵计算用来变换法向量的矩阵
        normalMatrix.setInverseOf(modelMatrix);
        normalMatrix.transpose();

        // // 模型矩阵
        // gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        // // mvp矩阵
        // gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
        // // 法向量矩阵
        // gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

        // 清屏|清深度缓冲
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        setUniforms(program, {
            u_viewPosition:[eyeX,eyeY,eyeZ],
            u_ModelMatrix: modelMatrix.elements,
            u_MvpMatrix: mvpMatrix.elements,
            u_NormalMatrix: normalMatrix.elements
        });
        // setBuffersAndAttributes(gl, program, buffer);
        // gl.drawElements(gl.TRIANGLES, buffer.numElements, buffer.indexType, 0);
        drawingInfos.forEach((polygon, i) => {
            buffer = buffers[i % buffers.length];
            setBuffersAndAttributes(gl, program, buffer);
            gl.drawElements(gl.TRIANGLES, buffer.numElements, buffer.indexType, 0);
        });

        requestAnimationFrame(animate);
    }());
}

document.addEventListener('keydown',function(e){
    if([37,38,39,65,58,83,87,40,69,81].indexOf(e.keyCode)>-1){
        notMan=false;
    }
    switch(e.keyCode){
        case 38:        //up
            viewAngleY-=2;
            if(viewAngleY<-270){
                viewAngleY+=360
            }
            break;
        case 40:        //down
            viewAngleY+=2;
            if(viewAngleY>270){
                viewAngleY-=360
            }
            break;
        case 37:        //left
            viewAngleX+=2;
            break;
        case 39:        //right
            viewAngleX-=2;
            break;
        case 87:        //w
            angleX-=2;
            break;
        case 83:        //s
            angleX+=2;
            break;
        case 65:        //a
            angleY+=2;
            break;
        case 68:        //d
            angleY-=2;
            break;
        case 81:        //q
            angleZ-=2;
            break;
        case 69:        //e
            angleZ+=2;
            break;
        case 187:       //zoom in
            if(viewLEN>6) viewLEN--;
            break;
        case 189:       //zoom out
            if(viewLEN<30) viewLEN++;
            break;
        default:break;
    }
},false);

main();

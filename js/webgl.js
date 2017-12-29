/**
 * WebGL library
 * author jeff zhong
 * date 2017/12/29
 * version 1.0
 */
;(function() {
    // webgl采用的是右手坐标系
    // z正值表示该对象是在屏幕/观众近，而z的负值表示该对象远离屏幕

    /**
     * 获取webgl上下文
     */
    function get3DContext(canvas, opt) {
        var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        var context = null;
        for (var i = 0, len = names.length; i < len; i++) {
            try {
                context = canvas.getContext(names[i], opt);
            } catch (e) {}
            if (context) {
                break;
            }
        }
        return context;
    }

    /**
     * 根据script id创建着色器
     * @param  {Object} gl  context
     * @param  {String} vid script id
     * @param  {String} fid script id
     * @return {Boolen} 
     */
    function initShaders(gl, vid, fid) {
        var shaders = getShaderString(vid, fid);
        if (!shaders.length) return false;
        var program = createProgram(gl, shaders[0], shaders[1]);
        if (!program) {
            console.log('Failed to create program');
            return false;
        }
        // 使用程序对象
        gl.useProgram(program);
        gl.program = program;
        return program;
    }

    /**
     * 获取着色器代码字符串
     * @param  {Object} gl  context
     * @param  {String} vid script id
     * @return {Array}
     */
    function getShaderString(vid, fid) {
        var vshader, fshader, element;
        [vid, fid].forEach(function(id) {
            element = document.getElementById(id);
            if (element) {
                switch (element.type) {
                    // 顶点着色器的时候  
                    case 'x-shader/x-vertex':
                        vshader = element.text;
                        break;
                        // 片段着色器的时候  
                    case 'x-shader/x-fragment':
                        fshader = element.text;
                        break;
                    default:
                        break;
                }
            }
        });
        if (!vshader) {
            console.log('VERTEX_SHADER String not exist');
            return [];
        }
        if (!fshader) {
            console.log('FRAGMENT_SHADER String not exist');
            return [];
        }
        return [vshader, fshader];
    }

    /**
     * 创建连接程序对象
     * @param  {Object} gl       上下文
     * @param  {String} vshader  顶点着色器代码
     * @param  {String} fshader  片元着色器代码
     * @return {Object}         
     */
    function createProgram(gl, vshader, fshader) {
        // 创建着色器对象
        var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
        var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
        if (!vertexShader || !fragmentShader) {
            return null;
        }

        // 创建程序对象
        var program = gl.createProgram();
        if (!program) {
            return null;
        }

        // 为程序对象分配着色器
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // 连接程序对象
        gl.linkProgram(program);

        // 检查连接结果
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            var error = gl.getProgramInfoLog(program);
            console.log('Failed to link program: ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }
        return program;
    }

    /**
     * 加载着色器
     * @param  {Object} gl     上下文
     * @param  {Object} type   类型
     * @param  {String} source 代码字符串
     * @return {Object}       
     */
    function loadShader(gl, type, source) {
        // 创建着色器对象
        var shader = gl.createShader(type);
        if (shader == null) {
            console.log('unable to create shader');
            return null;
        }

        // 向着色器程序填充代码
        gl.shaderSource(shader, source);

        // 编译着色器
        gl.compileShader(shader);

        // 检查编译结果
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            var error = gl.getShaderInfoLog(shader);
            console.log('Failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }
    
    if (typeof module !== 'undefined' && module.exports) {
        exports.get3DContext = get3DContext;
        exports.initShaders = initShaders;
        exports.getShaderString = getShaderString;
        exports.createProgram = createProgram;
        exports.loadShader = loadShader;
    } else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        define(function() {
            exports.get3DContext = get3DContext;
            exports.initShaders = initShaders;
            exports.getShaderString = getShaderString;
            exports.createProgram = createProgram;
            exports.loadShader = loadShader;
        });
    } else {
        window.get3DContext = get3DContext;
        window.initShaders = initShaders;
        window.getShaderString = getShaderString;
        window.createProgram = createProgram;
        window.loadShader = loadShader;
    }
}());

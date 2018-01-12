/**
 * WebGL library
 * author jeff zhong
 * date 2017/12/29
 * version 1.0
 */
;(function() {
    /**
     * webgl采用的是右手坐标系
     * z正值表示该对象是在屏幕/观众近，而z的负值表示该对象远离屏幕 
     */
     
    /**
     * 获取webgl上下文
     */
    function get3DContext(canvas, opt) {
        var names = ["webgl2","webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
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
     * 根据script id创建program
     * 参数形式(gl,[vid,sid],true)/(gl,vid,sid,true)
     * @param  {Object}        gl          context
     * @param  {Array/String}  ids         script id
     * @param  {Boolean}       useProgram  是否将program设置为当前使用
     * @return {Object} 
     */
    function initProgram(gl) {
        var args = Array.prototype.slice.call(arguments, 1),
            last = args.slice(-1)[0],
            useProgram = typeof last == 'boolean' ? useProgram = args.pop() : false;

        var shaders = getShaderString(args);
        if (!shaders.length) return null;
        var program = createProgram(gl, shaders[0], shaders[1]);
        if (!program) {
            console.log('Failed to create program');
            return null;
        }
        // 使用程序对象
        if (useProgram) {
            gl.useProgram(program);
            gl.program = program;
        }
        return program;
    }


    /**
     * 获取着色器代码字符串
     * @param  {Object}       gl  context
     * @param  {String/Array} vid script id
     * @return {Array}
     */
    function getShaderString(vid, fid) {
        var args = Array.prototype.slice.call(arguments),
            arr = [],
            vshader, fshader, element;

        String(args).replace(new RegExp('[^\\,\\s]+','g'), function(item) {
            if (item) { arr.push(item); }
        });

        arr.forEach(function(id) {
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
        if (!shader) {
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

    /**
     * 初始化 arrayBuffer
     * @param  {Object} gl     上下文
     * @param  {Object} option {data:[],num:3,type:gl.FLOAT}
     * @param  {Number} attr   attribute变量地址
     * @return {Object}      
     */
    function initBuffer(gl, option, attr) {
        var buffer = gl.createBuffer();
        if (!buffer) {
            console.log('Failed to create the buffer object');
            return null;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, option.data, gl.STATIC_DRAW);
        if (attr === 0 || attr > 0) {
            gl.vertexAttribPointer(attr, option.num || 3, option.type || gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(attr);
        }
        return buffer;
    }


    /**
     * 初始化 elementArrayBuffer
     * @param  {Object} gl   上下文
     * @param  {Array}  data 数据
     * @return {Object}      
     */
    function initElementBuffer(gl, data){
        var buffer = gl.createBuffer();
        if (!buffer) {
            console.log('Failed to create the element buffer object');
            return null;
        }
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
        return buffer;
    }

    /**
     * 获取attribute地址
     * @param  {Object} gl       上下文
     * @param  {Object} program 
     * @param  {String} name     名称
     * @return {Number}         
     */
    function getAttributeLocation(gl,program,name){
        var attr=gl.getAttribLocation(program, name);
        if(attr<0){
            console.log('Failed to get the storage location of attribute:'+name);
            return null;
        }
        return attr;
    }

    /**
     * 获取uniform地址
     * @param  {Object} gl       上下文
     * @param  {Object} program 
     * @param  {String} name     名称
     * @return {Object}              
     */
    function getUniformLocation(gl,program,name){
        var unif=gl.getUniformLocation(program, name);
        if(!unif){
            console.log('Failed to get the storage location of uniform:'+name);
            return null;
        }
        return unif;
    }

    var output = {
        get3DContext: get3DContext,
        getShaderString: getShaderString,
        loadShader: loadShader,
        createProgram: createProgram,
        initProgram: initProgram,
        initBuffer: initBuffer,
        initElementBuffer: initElementBuffer
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports=output;
    } else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
        define(function() {
            return output;
        });
    } else {
        for(var n in output){
            window[n]=output[n];
        }
    }
}());

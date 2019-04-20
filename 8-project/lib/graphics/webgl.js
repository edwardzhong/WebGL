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
     * @param  {Object} gl    context
     * @param  {Array}  ids   script id
     * @param  {String} isUse 是否将progra设置为当前使用
     * @return {Object} 
     */
    function initProgram(gl, ids, isUse) {
        var shaders = getShaderString(ids);
        if (!shaders.length) return null;
        var program = createProgram(gl, shaders[0], shaders[1]);
        if (!program) {
            console.log('Failed to create program');
            return null;
        }
        // 使用程序对象
        if(isUse){
            gl.useProgram(program);
            gl.program = program;
        }
        return program;
    }

    /**
     * 获取着色器代码字符串
     * @param  {Object} gl  context
     * @param  {String/Array} vid script id
     * @return {Array}
     */
    function getShaderString(vid, fid) {
        var arr=[],
            vshader, fshader, element;

        (String(vid||'')+','+String(fid||'')).replace(new RegExp('[^\\,\\s]+','g'), function(item) {
            if(item){arr.push(item); }
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
        if(attr===0||attr>0){
            gl.vertexAttribPointer(attr, option.num||3, option.type||gl.FLOAT, false, 0, 0);
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
     * 获取program对象
     * @param  {Object} gl     上下文
     * @param  {Array}  ids    script id
     * @param  {Array}  attr   attribute变量
     * @param  {Array}  unif   uniform变量名称
     * @return {Object}          
     */
    function createProgramInfo(gl,ids,attr,unif){
        var program=initProgram(gl,ids);
        if(!program)return null;
        return new ProgramInfo(gl,program,attr,unif);
    }

    function ProgramInfo(gl,program,attr,unif){
        this.gl=gl;
        this.program=program;
        this.attr={};
        this.unif={};
        this.init(attr,unif);
    }

    ProgramInfo.prototype={
        // 初始化
        init:function(attr,unif){
            var gl=this.gl,
                program=this.program,
                attrLoc;

            if(attr&&attr.length){
                attr.forEach(name=>{
                    attrLoc=getAttributeLocation(gl,program,name);
                    if(attrLoc>=0){
                        if(name.search(/a_position/i)>=0){
                            this.attr.a_position=attrLoc; 
                        } else if(name.search(/a_color/i)>=0){
                            this.attr.a_color=attrLoc; 
                        } else if(name.search(/a_normal/i)>=0){
                            this.attr.a_normals=attrLoc; 
                        }
                    }  
                });
            } else {// 获取默认字段的地址
                this.setAttributes(['a_position','a_Position']);
                this.setAttributes(['a_color','a_Color']);
                this.setAttributes(['a_normals','a_Normals','a_normal','a_Normal']);
            }

            if(unif&&unif.length){
                unif.forEach(name=>{
                    attrLoc=getUniformLocation(gl,program,name);
                    if(attrLoc){
                        this.unif[name]=attrLoc; 
                    }
                });
            }
        },
        // 将缓冲内容通过对应变量输出
        setBufferAttributes:function(buffers){
            for(var name in this.attr){
                if(name=='a_position'){
                    buffers.outputPosition(this.attr.a_position);
                } else if(name=='a_color'){
                    buffers.outputColor(this.attr.a_color);
                } else if(name=='a_normals'){
                    buffers.outputNormals(this.attr.a_normals);
                }
            }
        },
        // 设置uniform变量
        setUniforms:function(option){
            var gl=this.gl,
                program=this.program,
                val;
            for(var name in option){
                val=option[name];
                this.unif[name]=this.unif[name]||getUniformLocation(gl,program,name);
                if(this.unif[name]&&val!=undefined){
                    this.setParamter(this.unif[name],val);
                }
            }
        },
        // 按名称查找attribute变量地址,找到后存储到当前对象中
        setAttributes:function(names){
            var prop=names[0],
                program=this.program,
                attrLoc;
            for(var i=0,l=names.length;i<l;i++){
                if(this.attr[prop]===0||this.attr[prop]>0)break;
                attrLoc=getAttributeLocation(this.gl,program,names[i]);
                if(attrLoc===0||attrLoc>0){
                    this.attr[prop]=attrLoc;
                }
            }
        },
        // 设置uniform变量的值
        setParamter:function(loc,val){
            var gl=this.gl,
                len=val instanceof Array?val.length:typeof val == 'object'?val.length:1,
                exp=Math.sqrt(len);

            if(exp==3||exp==4){//矩阵
                gl['uniformMatrix'+exp+'fv'](loc, false, val);
            } else if(len>1){//2~4位的坐标/向量/颜色
                gl['uniform'+len+'fv'](loc,val);
            } else {// 单个值默认传递浮点, int值使用不加点的字符串:'num'代替
                if(typeof val=='string'&&!/\./.test(val)){
                    gl['uniform1i'](loc,parseInt(val,10));
                } else if(typeof val=='number'){
                    gl['uniform1f'](loc,parseFloat(val,10));
                }
            }
        }
    };

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

    /**
     * 初始化帧缓冲区对象 (FBO)  
     * @param  {Object} gl 上下文
     * @return {Object}    
     */
    function initFramebufferObject(gl) {
        var framebuffer, texture, depthBuffer;

        // Define the error handling function
        var error = function() {
            if (framebuffer) gl.deleteFramebuffer(framebuffer);
            if (texture) gl.deleteTexture(texture);
            if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
            return null;
        }

        // Create a framebuffer object (FBO)
        framebuffer = gl.createFramebuffer();
        if (!framebuffer) {
            console.log('Failed to create frame buffer object');
            return error();
        }

        // Create a texture object
        texture = gl.createTexture(); 
        if (!texture) {
            console.log('Failed to create texture object');
            return error();
        }
        // set texture object size and parameters
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        // Create a renderbuffer object
        depthBuffer = gl.createRenderbuffer(); 
        if (!depthBuffer) {
            console.log('Failed to create renderbuffer object');
            return error();
        }
        // Set renderbuffer object size and parameters
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

        // Attach the texture and the renderbuffer object to the FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        // Check if FBO is configured correctly
        var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (gl.FRAMEBUFFER_COMPLETE !== e) {
            console.log('Frame buffer object is incomplete: ' + e.toString());
            return error();
        }

        framebuffer.texture = texture; // keep the required object

        // Unbind the buffer object
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return framebuffer;
    }

    /**
     * 缓冲区对象
     * @param {Object} gl    
     * @param {Object} option 
     * option 格式:
     * {
     *     position:{data:[],num:3,type:gl.FLOAT},
     *     color:{},
     *     normal:{},
     *     texCoord:{},
     *     indices:{}
     * }
     */
    function BufferInfo(gl,option){
        this.gl=gl;
        this.num=0;
        this.buffer={};

        for(var p in option){
            this[p]=option[p];
        }
        if(this.position&&this.position.data){
            this.buffer.position = initBuffer(gl, this.position);    
        }
        
        if(this.color&&this.color.data){
            this.buffer.color = initBuffer(gl, this.color);
        }

        if(this.normals&&this.normals.data){
            this.buffer.normals = initBuffer(gl, this.normals);
        } 

        if(this.indices&&this.indices.data){
            this.buffer.index = initElementBuffer(gl, this.indices.data);
            this.num=this.indices.data.length;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    BufferInfo.prototype={
        // 输出地址
        outputPosition:function(attr){
            if(!this.buffer.position||attr<0)return;
            var gl=this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.position);
            gl.vertexAttribPointer(attr, this.position.num||3, this.position.type||gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(attr);
        },
        // 输出颜色
        outputColor:function(attr){
            if(!this.buffer.color||attr<0)return;
            var gl=this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.color);
            gl.vertexAttribPointer(attr, this.color.num||3, this.color.type||gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(attr);
        },
        // 输出法线
        outputNormals:function(attr){
            if(!this.buffer.normals||attr<0)return;
            var gl=this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer.normals);
            gl.vertexAttribPointer(attr, this.normals.num||3, this.normals.type||gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(attr);
        },
        // 输出顶点索引
        outputIndex:function(){
            if(!this.buffer.index)return;
            var gl=this.gl;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer.index);
        }
    };

    var output = {
        get3DContext: get3DContext,
        getShaderString: getShaderString,
        createProgram: createProgram,
        loadShader: loadShader,
        createProgramInfo: createProgramInfo,
        initProgram: initProgram,
        initBuffer: initBuffer,
        initElementBuffer: initElementBuffer,
        initFramebufferObject: initFramebufferObject,
        createBuffer: function(gl,option){return new BufferInfo(gl,option) }
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

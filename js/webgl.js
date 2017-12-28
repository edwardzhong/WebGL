// webgl采用的是右手坐标系
// z正值表示该对象是在屏幕/观众近，而z的负值表示该对象远离屏幕

function get3DContext(canvas, opt) {
  var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
  var context = null;
  for (var i = 0, len=names.length; i < len; i++) {
    try {
      context = canvas.getContext(names[i], opt);
    } catch(e) {}
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
function initShaders(gl,vid,fid){
    var vshader,fshader,element,program;

    [vid,fid].forEach(function(id){
        element= document.getElementById(id);
        if(element){
            switch(element.type){  
                // 顶点着色器的时候  
                case 'x-shader/x-vertex': vshader = element.text; break;
                // 片段着色器的时候  
                case 'x-shader/x-fragment': fshader = element.text; break;
                default : break;
            }
        }
    });
    if(!vshader){
        console.log('VERTEX_SHADER String not exist');
        return false;
    }
    if(!fshader){
        console.log('FRAGMENT_SHADER String not exist');
        return false;
    }
    program = createProgram(gl, vshader, fshader);
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
 * 创建缓冲区
 * @param  {Array} data
 * @param  {Object} bufferType
 * @return {Object}     
 */
function createBuffer(data,bufferType){  
    // 生成缓存对象  
  var buffer = gl.createBuffer();  
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // 绑定缓存(gl.ARRAY_BUFFER<顶点>||gl.ELEMENT_ARRAY_BUFFER<顶点索引>) 
  gl.bindBuffer(bufferType||gl.ARRAY_BUFFER, buffer);  
    
  // 向缓存中写入数据  
  gl.bufferData(bufferType||gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);  
    
  // 将绑定的缓存设为无效  
  // gl.bindBuffer(gl.ARRAY_BUFFER, null);  
    
  // 返回生成的buffer  
  return buffer;
} 

// PI约等于3.14
// 180度 = PI弧度
// 1弧度 =（PI/180）* 度
// 1度 = （180/PI）* 弧度
// 反正切:atan(y/x)=弧度; 正切:tan(y/x)*x=y边的长度 
// 反正切:atan2(y,x)使用范围更广: PI ~ -PI,可以处理除数和被除数为0的情况，即90度和270的情况,推荐使用atan2
window.requestAnimationFrame=window.requestAnimationFrame 
    || window.webkitRequestAnimationFrame 
    || window.mozRequestAnimationFrame 
    || window.oRequestAnimationFrame 
    || window.msRequestAnimationFrame 
    || function(callback) {return window.setTimeout(callback, 1000/60); },

window.cancelAnimationFrame=window.cancelRequestAnimationFrame
    || window.webkitCancelAnimationFrame
    || window.webkitCancelRequestAnimationFrame
    || window.mozCancelRequestAnimationFrame
    || window.oCancelRequestAnimationFrame
    || window.msCancelRequestAnimationFrame
    || clearTimeout;

   
function Random(a, b) {
  return Math.random() * (b - a) + a;
}

function RandomColor(){
  var c=Math.floor(Math.random()*16777216);
  return '#'+('000'+c.toString(16)).slice(-6);
}

function RandomHsl(){
  var h=Math.floor(Math.random()*360);
  var s=Math.floor(Math.random()*50+50);
  var l=Math.floor(Math.random()*20+40);
  return [h,s,l];
}

var Color={
  /**
   * rgb转换为16进制颜色
   * @param {String} txt rgba(255,255,255,1)
   * return #ffffff
   */
  rgbToHex:function(txt){
      var ret='';
      if(/^rgba?|RGBA?/.test(txt)){
        var arr=txt.match(/\d+/g),hex='';
        if(!arr||arr.length<3){return ret;}
        for(var i=0;i<3;i++){
          hex=Math.min(parseInt(arr[i],10),255).toString(16);
          ret+=('0'+hex).slice(-2);
        }
        ret='#'+ret;
      }
      return ret;
  },
  /**
   * 16进制转换为rgb
   * @param {String} txt #ffffff
   * return rgb(255,255,255)
   */ 
  hexToRgb:function(txt){
    var ret=[];
    var hex=txt.toLowerCase();
        if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(hex)){
            var step=hex.length==4?1:2;
            for(var i=1;i<3*step+1;i+=step){
                ret.push(parseInt("0x"+new Array(4-step).join(hex.slice(i,i+step))));
            }
        }
    return ret;
  },
  /**
   * rgb转换为hsl
   * @param {Array} rgb [255,255,255]
   * return [0,0,100]
   */
  rgbToHsl:function(rgb){
    var H, S, L;
    var r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    L = (max + min) / 2;
    var diff = max - min;
    S = diff == 0 ? 0 : diff / (1 - Math.abs(2 * L- 1));
    if(S == 0){
      H = 0;
    }else if(r == max){
      H = (g - b) / diff % 6;
    }else if(g == max){
      H = (b - r) / diff + 2; 
    }else{
      H = (r - g) / diff + 4;
    }
    H *= 60;
    if(H < 0) H += 360;
    return [Math.round(H), (S * 100).toFixed(1), (L * 100).toFixed(1)];
  },

  /**
   * hsl转换为rgb
   * @param {Array} hsl [0,0,100]
   * return [255,255,255]
   */
  hslToRgb:function(hsl){
    var H = parseFloat(hsl[0]/360,10), S = parseFloat(hsl[1]/100,10), L = parseFloat(hsl[2]/100,10); 
    if(S == 0){
      var r = g = b = Math.ceil(L * 255);
      return [r, g, b];
    } else {
      var t2 = L >= 0.5 ? L + S - L * S : L * (1 + S);
      var t1 = 2 * L - t2;

      var tempRGB = [1/3, 0, -1/3];
      for(var i = 0; i < 3; i++){
        var t = H + tempRGB[i];
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(6 * t < 1){
          t = t1 + (t2 - t1) * 6 * t;
        }else if(2 * t < 1){
          t = t2;
        }else if(3 * t < 2){
          t = t1 + (t2 - t1) * (2 / 3 - t) * 6;
        }else {
          t = t1;
        }
        tempRGB[i] = Math.ceil(t * 255); 
      }
      return tempRGB;
    }
  },
  hexToHsl:function(txt){
    return this.rgbToHsl(this.hexToRgb(txt))
  },
  hslToHex:function(txt){
    var ret=''
    if(/^hsla?|HSLA?/.test(txt)){
      var hsl=txt.match(/\d+/g);
      if(hsl&&hsl.length>=3){
        var rgb='rgb('+this.hslToRgb(hsl).join(',')+')'
        return this.rgbToHex(rgb);
      }
    }
    return ret;
  },
  hslToWebgl:function(hsl){
    var rgb=this.hslToRgb(hsl);
    return [
      rgb[0]/255,
      rgb[1]/255,
      rgb[2]/255,
      hsl[3]||1.0
    ];
  }
};

//将鼠标位置定位到webGL坐标
function WindowToWebgl(canvas,x,y){
  var box=canvas.getBoundingClientRect(),
      w=canvas.width,
      h=canvas.height,
      x1=x-box.left*(w/box.width),
      y1=y-box.top*(h/box.height);
  return{
    x:(x1-w/2)/(w/2),
    y:(h/2-y1)/(h/2)
  };
}




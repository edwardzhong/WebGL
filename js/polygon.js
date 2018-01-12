	// var va = vec4(0.0, 0.0, -1.0,1);
	// var vb = vec4(0.0, 0.942809, 0.333333, 1);
	// var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
	// var vd = vec4(0.816497, -0.471405, 0.333333,1);	

	function Polygon(position,normal,color,indices){
		this.position=position;
		this.normal=normal;
		this.color=color;
		this.indices=indices;
	}
	/**
	 * 平面(2*0*2)
	 */
	function plane(color){
		//  v0------v1
	    //  |        | 
	    //  |        |
	    //  |        |
	    //  v3------v2
		color=color||[1,1,1,1];
		var positions = [-1,0,-1,  1,0,-1,  1,0,1,  -1,0,1],
	        normals = [0,1,0,0,1,0,0,1,0,0,1,0],
	        colors = color,
	        indices = [1,3,0,1,2,3];

	    return new Polygon(positions,normals,colors,indices);
	}


	function Cube(color){
	    //    v4----- v7
	    //   /|      /|
	    //  v0------v1|
	    //  | |     | |
	    //  | |v5---|-|v6
	    //  |/      |/
	    //  v3------v2
	    //
	    color=color||[1,1,1,1];
	    var colors=[];
	    for(var i=0;i<24;i++){
	    	colors.push(...color);
	    }

	    // 顶点
	    var positions = [
	         -0.5, 0.5, 0.5,   0.5, 0.5, 0.5,   0.5, -0.5, 0.5,  -0.5, -0.5, 0.5, // v0-v1-v2-v3 front
	         0.5, 0.5, 0.5,    0.5, 0.5, -0.5,  0.5, -0.5,-0.5,  0.5, -0.5, 0.5, // v1-v7-v6-v2 right
	         -0.5,0.5, -0.5,   0.5, 0.5, -0.5,  0.5, 0.5, 0.5,   -0.5, 0.5, 0.5, // v4-v7-v1-v0 up
	         -0.5, 0.5, 0.5,   -0.5,0.5, -0.5,  -0.5,-0.5,-0.5,  -0.5, -0.5, 0.5, // v0-v4-v5-v3 left
             -0.5,-0.5,-0.5,  -0.5, -0.5, 0.5,  0.5, -0.5, 0.5,  0.5, -0.5,-0.5, // v5-v3-v2-v6 down
	         -0.5,0.5, -0.5,  -0.5,-0.5,-0.5,   0.5, -0.5,-0.5,  0.5, 0.5, -0.5  // v4-v5-v6-v7 back
	    ];

	    // 法向量
	    var normals = [
	        0, 0, 1,   0, 0, 1,   0, 0, 1,  0, 0, 1,     // v0-v1-v2-v3 front
	        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v7-v6-v2 right
	        0, 1, 0,   0, 1, 0,   0, 1, 0,  0, 1, 0,     // v4-v7-v1-v0 up
	        -1, 0, 0,  -1, 0, 0,  -1, 0, 0, -1, 0, 0,     // v0-v4-v5-v3 left
	        0, -1, 0,  0, -1, 0,  0, -1, 0, 0, -1, 0,　   // v5-v3-v2-v6 down
	        0, 0, -1,  0, 0, -1,  0, 0, -1, 0, 0, -1      // v4-v5-v6-v7 back
	    ];

	    // 顶点索引
	    var indices = new Uint8Array([
	         0, 1, 2,   0, 2, 3,    // front
	         4, 5, 6,   4, 6, 7,    // right
	         8, 9,10,   8,10,11,    // up
	        12,13,14,  12,14,15,    // left
	        16,17,18,  16,18,19,    // down
	        20,21,22,  20,22,23     // back
	    ]);

	    return new Polygon(positions,normals,colors,indices);
	}

	/**
	 * 圆球(1*1*1)
	 */
	function Sphere(len, color) {
	    len = len || 15;
	    color=color||[1,1,1,1];

	    var i, ai, si, ci;
	    var j, aj, sj, cj;
	    var p1, p2;
	    var pos = [],nor=[];

	    var positions = [],
	        normals = [],
	        colors = [],
	        indices = [];

	    // 创建顶点坐标
	    for (j = 0; j <= len; j++) {
	        aj = j * Math.PI / len;
	        sj = Math.sin(aj);
	        cj = Math.cos(aj);
	        for (i = 0; i <= len; i++) {
	            ai = i * 2 * Math.PI / len;
	            si = Math.sin(ai);
	            ci = Math.cos(ai);

	            pos = [si * sj, cj, ci * sj];// x y z
	            positions.push(...pos);

	            nor=normalize(pos);// 归一化后的顶点坐标就是法向量
	            normals.push(...nor);

	            colors.push(...color);// 颜色
	        }
	    }
	    // 创建顶点索引
	    for (j = 0; j < len; j++) {
	        for (i = 0; i < len; i++) {
	            p1 = j * (len + 1) + i;
	            p2 = p1 + (len + 1);

	            indices.push(p1);
	            indices.push(p2);
	            indices.push(p1 + 1);

	            indices.push(p1 + 1);
	            indices.push(p2);
	            indices.push(p2 + 1);
	        }
	    }

	    return new Polygon(positions,normals,colors,indices);
	}

	function cylinder(){

	}
	
    function normalize(v) {
        var c = v[0],
            d = v[1],
            e = v[2],
            g = Math.sqrt(c * c + d * d + e * e);
        if (!g) {
            v[0] = 0;
            v[1] = 0;
            v[2] = 0;
            return v;
        }
        if (g == 1) return v;
        g = 1 / g;
        v[0] = c * g;
        v[1] = d * g;
        v[2] = e * g;
        return v;
    }

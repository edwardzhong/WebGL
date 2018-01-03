
## WebGL 高级技术

0.如何实现选中物体

    1.当鼠标按下，物体重绘为红色（或如何其他能区分的颜色）
    2.读取鼠标点击处像素的颜色 gl.readPixels(x,y,width,height,format,type,pixels)
    3.使用物体原来的颜色进行重绘，以恢复物体本来颜色
    4.用第2步读取到的颜色是红色，则点击中了

1.如何实现雾化

    实现雾化的方式由多种，这里使用最简单的一种：线性雾化（linear fog）。在线性雾化中，某一点的雾化程度取决于它与视点之间的距离，距离越远雾化程度越高。线性雾化有起点和终点，起点表示开始雾化之处，终点表示完全雾化之处两点之间某一点的雾化程度与该点与视点的距离呈线性关系。比终点更远的点完全雾化了，即完全看不见了。

    某一点雾化的程度可以被定义为雾化因子（fog factor），并在线性雾化公式中被计算出来：

    <雾化因子> = (<终点> - <当前点与视点间的距离>) / (<终点> - <起点>)
    
    这里：

    <起点> <= <当前点与视点间的距离> <= <终点>
    
    雾化因子为1.0，表示该点完全没有被雾化，可以很清晰地看到此处的物体。如果为0.0, 就表示改点完全被雾化了。起点因子的线形图如下所示：


2.片元着色器中包含雾化因子的片元颜色计算

    计算公式如下：

    <片元颜色> = <物体表面颜色> * <雾化因子> + <雾化颜色> * (1 - <雾化因子>)

3.使用顶点的w分量作为当前点与视点间的距离

    之前，我们并未显示使用过gl_Position的w分量，实际上，这个w分量的值就是顶点的视图坐标的z分量乘以-1。在视图坐标系中，视点在原点，视线沿着Z轴负方向，观察者看到的物体其视图坐标系值z分量都是负的，而gl_Position的w分量正好是z分量值乘以-1，所以可以直接使用该值来近似顶点和视点建的距离。

4.绘制圆形的点

    为了将矩形削成圆形，需要知道每个片元在光栅化过程中的坐标。在第5章的一个示例程序中，在片元着色器中通过内置变量gl_FragCoord来访问片元的坐标。实际上，片元着色器还提供了另外一个内置变量gl_PointCoord。这个变量可以帮助我们绘制圆形的点。片元着色器内置变量：

    变量类型和名称/描述

    vec4 gl_FragCoord/片元在窗口坐标
    vec4 gl_PointCoord/片元在被绘制的点内的坐标（从0.0到1.0）

    gl_PointCoord坐标值的区间从0.0到1.0，如下图所示。
    为了将矩形削成圆形，需要将与中心点（0.5, 0.5）距离超过0.5,也就是将圆外的片元剔除掉。在片元着色器中，可以使用discard语句来放弃当前片元。

    在片元着色器中的代码实现方式如下：

    #ifdef GL_ES
    precision mediump float;
    #endif
    void main(){
        float distance = distance(gl_PointCoord, vec2(0.5, 0.5));
        if (distance <= 0.5){
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        } else {
            discard;
        }
    }

5.α混合

    我们要让物体实现半透明，实现这种效果需要用到颜色的a分量。该功能被称为a混合（alpha blending）或混合（blending），WebGL已经内置了该功能，值需要开启即可。

    如何实现a混合？

    1.开启混合功能：gl.enable(gl.BLEND)。

    2.指定混合函数：gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)。

    如果我们只设置了颜色的第四个分量，是看不到透明效果的，必须要执行上面两个步骤。

6.gl.blendFunc(src_factor, dst_factor)

    通过参数src_factor和dst_factor指定进行混合操作的函数，混合后的颜色如下计算：

    <混合后的颜色> = <源颜色> * src_factor + <目标颜色> * dst_factor
    参数：

    src_factor:指定源颜色在混合颜色重的权重因子，如下表所示

    dst_factor:指定目标颜色在混合后颜色重的权重因子，如下表所示

    常量/R分量的系数/G分量的系数/B分量的系数

    gl.ZERO/0.0/0.0/0.0

    gl.ONE/1.0/1.0/1.0

    gl.SRC_COLOR/Rs/Gs/Bs

    gl.ONE_MINUS_SRC_COLOR/(1-Rs)/(1-Gs)/(1-Bs)

    gl.DST_COLOR/Rd/Gd/Bd

    gl.ONE_MINUS_DST_COLOR/(1-Rd)/(1-Gd)/(1-Bd)

    gl.SRC_ALPHA/As/As/As

    gl.ONE_MINUS_SRC_ALPHA/(1-As)/(1-As)/(1-As)

    gl.DST_ALPHA/Ad/Ad/Ad

    gl.ONE_MINUS_DST_ALPHA/(1-Ad)/(1-Ad)/(1-Ad)

    gl.SRC_ALPHA_SATUREATE/min(As,Ad)/min(As,Ad)/min(As,Ad)

    上表中，(Rs,Gs,Bs, As)和(Rd,Gd,Bd,Ad)表示源颜色和目标颜色的各个分量。

    假如源颜色是半透明的绿色（0.0, 1.0, 0.0, 0.4），目标颜色是普通的黄色（1.0, 1.0, 0.0, 1.0），调用函数：

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

7.透明和不透明物体共存

    在使用a混合功能时，我们屏蔽掉了隐藏面消除功能(去掉了代码gl.enable(gl.DEPTH_TEST)。关闭隐藏面消除功能只是一个粗暴的解决方案，并不能满足实际的需求。实际上，通过某些机制，可以同时实现隐藏面消除和半透明效果。我们只需要：

    1.开启隐藏面消除功能:gl.enable(gl.DEPTH_TEST)。

    2.绘制所有不透明的物体(a为1.0)。

    3.锁定用于进行隐藏面消除的深度缓冲区的写入操作，使之只读。调用：

    gl.depthMask(false);

    4.绘制所有半透明的物体（a小于1.0），注意他们应当按照深度排序，然后从后向前绘制。

    5.释放深度缓冲区，使之可读可写。调用：

    gl.depthMask(true)

8.gl.depthMask(mask)

    锁定或释放深度缓冲区的写入操作。参数：

    mask:指定是锁定深度缓冲区的写入操作（false），还是释放之（true）

9.渲染到文理

    WebGL可以把渲染的三维图形作为纹理贴到另一个三维物体上去。要实现这个功能，需要提到两个新的对象：帧缓冲区对象和渲染缓冲区对象。
    帧缓冲区对象（framebuffer object）可以用来代替颜色缓冲区或深度缓冲区，如下图所示。绘制在帧缓冲区中的对象并不会直接显示canvas上，可以先对帧缓冲区中的内容进行一些处理再显示，或者直接用其中的内容作为纹理图像。在帧缓冲区中进行绘制的过程又称为离屏绘制（offscreen drawing）。

    帧缓冲区对象的结构如下图所示。绘制操作并不是直接发生在帧缓冲区中的，而是发生在帧缓冲区所关联的对象（attachment）上。一个帧缓冲区有3个关联对象：颜色缓冲区（color attachment）、深度缓冲区（depth attachment）、模板关联对象（stencil attachment），分别用来代码颜色缓冲区、深度缓冲区、模板缓冲区。

    每个关联对象又可以是两种类型的：纹理对象或渲染缓冲区对象（renderbuffer object）。

10.渲染到纹理，帧缓冲区配置步骤

    1.创建帧缓冲区对象（gl.createFramebffer()）。
    2.创建文理对象并设置其尺寸和参数（gl.createTexture()、gl.bindTexture()、gl.texImage2D()、gl.Parameteri()）。
    3.创建渲染缓冲区对象（gl.createRenderbuffer()）.
    4.绑定渲染缓冲区对象并设置其尺寸（gl.bindRenderBuffer()、gl.renderbufferStorage()）。
    5.将帧缓冲区的颜色关联对象指定为一个文理对象（gl.frambufferTexture2D()）。
    6.将帧缓冲区的深度关联对象指定为一个渲染缓冲区对象（gl.framebufferRenderbuffer()）。
    7.检查帧缓冲区是否正确配置（gl.checkFramebufferStatus()）。
    8.在帧缓冲区中进行绘制（gl.bindFramebuffer()）。

11.gl.createFramebuffer()

    创建帧缓冲区对象。

12.gl.deleteFramebuffer(framebuffer)

    删除帧缓冲区对象。参数：

    framebuffer:将要被删除的帧缓冲区对象

13.gl.createRenderbuffer()

    创建渲染缓冲区对象

14.deleteRenderbuffer(renderbuffer)

    删除渲染缓冲区对象。参数：
    renderbuffer:将要被删除的帧缓冲区对象

15.gl.bindRenderbuffer(target, renderbuffer)

    将renderbuffer指定的渲染缓冲区对象绑定在target目标上。如果renderbuffer为null，则将已经绑定在target目标上的渲染缓冲区对象解除绑定。参数：
    target：必须为gl.RENDERBUFFER
    renderbuffer:指定被绑定的渲染缓冲区

16.gl.renderbufferStorage(target, internalformat, width, height)

    创建并初始化渲染缓冲区的数据区。作为深度关联对象的渲染缓冲区，其宽度和高度必须与作为颜色关联对象的文理缓冲区一致。参数：

    target:必须为gl.RENDERBUFFER
    internalformat:指定渲染缓冲区中的数据格式。格式包括：gl.DEPTH_COMPONENT16,表示渲染缓冲区将代替深度缓冲区；gl.STENCIL_INDEX8,表示渲染缓冲区将替代模板缓冲区；gl.RGBA4,表示渲染缓冲区将替代颜色缓冲区，表示这4个分量各占据4个比特；gl.RGB5_A1,表示RGB个占据5个比特而A占据1个比特；gl.RGB565,表示RGB分别占据5、6、5个比特
    width和height:指定渲染缓冲区的宽度和高度以像素为单位

17.gl.bindFramebuffer(target, framebuffer)

    将framebuffer指定的帧缓冲区对象绑定到target目标上。如果framebuffer为null，那么已经绑定到target目标上的帧缓冲区对象将被解除绑定。参数：
    target：必须是gl.FRAMEBUFFER
    framebuffer:指定被绑定的帧缓冲区对象

18.gl.framebufferTexture2D(target, attachment, textarget, texture, level)

    将texture指定的文理对象关联到绑定在target目标上的帧缓冲区。参数：
    target:必须是gl.FRAMEBUFFER
    attachment:指定关联的类型。包括：gl.COLOR_ATTACHMENT0,表示texture是颜色关联对象；gl.DEPTH_ATTACHMENT,表示texture是深度关联对象
    textarget:同textureImage2D()函数的第一个参数（gl.TEXTURE_2D或gl.TEXTURE_CUBE）
    texture:指定关联的文理对象
    level:指定为0（在使用MIPMAP纹理时指定纹理的层级）
    attachment参数的取值之一gl.COLOR_ATTACHMENT0，其中有个0。这是因为，在OpenGL中，帧缓冲区可以具有多个颜色关联对象（gl.COLOR_ATTACHMENT0, gl.COLOER_ATTACHMENT1等等），但WebGL中只可以有一个。

19.gl.framebufferRenderbuffer(target, attachment, renderbuffertarget, renderbuffer)

    将renderbuffer指定的渲染缓冲区对象关联到绑定在target上的帧缓冲区对象。参数：
    target:必须是gl.FRAMEBUFFER
    attachment:指定关联的类型。gl.COLOR_ATTACHMENT0,表示renderbuffer是颜色关联对象；gl.DEPTH_ATTACHMENT,表示renderbuffer是深度关联对象；gl.STENCIL_ATTACHMENT,表示renderbuffer是模板关联对象
    renderbuffertarget:必须是gl.RENDERBUFFER
    renderbuffer:指定被关联的渲染缓冲区对象

20.gl.checkFramebufferStatus(target)

    检查绑定在target上的帧缓冲区对象的配置状态。参数：
    target:必须为gl.FRAMEBUFFER
    返回值：0,target不是gl.FRAMEBUFFER。其他包括：gl.FRAMEBUFFER_COMPLETE,帧缓冲区对象正确配置；gl.FRAMEBUFFER_INCPOMPLETE_ATTACHMENT,某一个关联对象为空，或者关联对象不合法；gl.FRAMEBUFFER_INCOMPOLETE_DIMENSIOUS,颜色关联对象和深度关联对象的尺寸不一致；gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT,帧缓冲区尚未关联任何一个关联对象

21.gl.viewport(x, y, width, height)

    设置 gl.drawArrays()和 gl.drawElements()函数的绘图区域。在cavans上绘图时，x和y就是canvas中的坐标。参数：
    x,y:指定绘图区域的左上角，以像素为单位
    width,height：指定绘图区域的宽度和高度

22.绘制阴影

    实现阴影有若干不同的方法，经常采用的是阴影贴图（shadow map），或称深度贴图（depth map）。
    该方法具有较好的表现力，在多种计算机图形学的场合，甚至电影特效总都有所使用。
    我们需要用到光源和物体之间的距离（实际上也就是物体在光源坐标系下的深度z值）来决定物体是否可见。如下图所示，同一条光线上有两个点P1和P2，由于P2的z值大于P1，所以P2在阴影中。

    我们需要使用两对着色器以实现阴影：
    （1）一对着色器用来计算光源到物体的距离，
    （2）另一对着色器根据(1)中计算出的距离绘制场景。使用一张文理图像把（1）的结果传入（2）中，这张文理图像就被称为阴影贴图（shadow map），而通过阴影贴图实现阴影的方法就被称为阴影映射（shadow mapping）。

23.读取OBJ模型文件步骤

    1.准备Float32Array类型的数组vertices，从文件中读取模型的顶点坐标数据并保存到其中；

    2.准备Float32Array类型的colors，从文件中读取模型的顶点颜色数据并保存到其中；

    3.准备Float32Array类型的数组normals，从文件中读取模型的顶点法线数据并保存到其中；

    4.准备Unit32Array（或Uint8Array）类型的数组indices,从文件中读取顶点索引数据并保存在其中，顶点索引数据定义了组成整个模型的三角序列；

    5.将前4步骤获取的数据写入缓冲区中，调用gl.drawElements()以绘制出整个立方体；

24.OBJ文件格式

    OBJ格式的文件由若干个部分组成，包括顶点坐标部分、表面定义部分、材质（material，即表面的样式，可能是单色或渐变色，也可能贴有纹理）定义部分等。每个部分定义了多个顶点、法线、表面等等。
## WebGL 颜色与纹理
1.纹理坐标

    纹理坐标是纹理图像上的坐标，通过纹理坐标可以在纹理图像上获取纹理颜色。WebGL系统中的纹理坐标系统是二维的，如图所示。为了将纹理坐标和广泛使用的x、y坐标区分开来，WebGL使用s和t命名纹理坐标（st坐标系统）。

    纹理图像的四个角坐标为左下角（0.0，0.0），右下角（1.0,0.0），右上角（1.0， 1.0）和左上角（0.0， 1.0）。
    纹理坐标很通用，因为坐标值与图像自身的尺寸无关，不管是128*128还是128*256的图像，右上角的纹理坐标始终是(1.0, 1.0)。

2.纹理映射步骤

    1.准备好映射到几何图形上的纹理图像。

    2.为几何图形配置纹理映射方式。

    3.加载纹理图像，对其进行写配置，以在WebGL中使用它。

    4.在片元着色器中将相应的纹理从纹理中抽取出来，并将纹素的颜色赋给片元。

3.gl.createTexture()

    创建纹理对象以存储纹理图像。

4.gl.deleteTexture()

    使用texture删除纹理对象。如果删除一个已经被删除的纹理对象，不会报错也不会产生任何影响。

5.gl.pixelStorei(pname, param)

    使用pname和param指定的方式处理加载得到的图像。参数

    pname:可以是以下二者之一。gl.UNPACK_FLIP_Y_WEBGL,对图像进行Y轴反转。默认值为false；gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,将图像RGB颜色值的每一个分量乘以A。默认为false；WEBGL，默认值为false。

    param:指定非0（true）或0（false）。必须为整数。

    例如：gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)，将图像进行Y轴反转。由于WebGL纹理坐标系统中的t轴的方向和PNG、BMP、JPG等格式图片的坐标系的Y轴方向相反。因此，只有将图像的Y轴进行反转，才能够正确地将图像映射到图形上。

6.gl.activeTexture(texUnit)

    激活texUnit指定的纹理单元。参数：

    texUnit:指定准备激活的纹理单元：gl.TEXTURE0、gl.TEXTURE1…、gl.TEXTURE7。最后的数字表示纹理单元的编号

    系统支持的纹理单元个数取决于硬件和浏览器的WebGL实现，但在默认情况下，WebGL至少支持8个纹理单元。

7.gl.bindTexture(target, texture)

    开启texture指定的纹理对象，并将其绑定到target上。此外，如果已经通过gl.activeTexture()激活了某个纹理单元，则纹理对象也会绑定到这个纹理单元上。参数：

    target:gl.TEXTURE_2D或gl.TEXTURE_BUVE_MAP

    texture:表示绑定的纹理对象

    例如，之前执行了gl.activeTexture(gl.TEXTURE0)函数，激活了第0个纹理单元。现在执行gl.bindTexture(gl.TEXTURE_2D, texture)。那么纹理对象texture也会绑定到纹理单元gl.TEXTURE0上。

8.gl.texParameteri(target, pname, param)

    将param的值赋给绑定到目标的纹理对象的pname参数上。参数：

    target:gl.TEXTURE_2D或gl.TEXTURE_CUBE_MAP

    pname:纹理参数

    param:纹理参数的值

    pname可指定4个纹理参数：

    放大方法（gl.TEXTURE_MAP_FILTER）:当纹理的绘制范围比纹理本身更大时，如何获取纹理颜色。比如说，将16*16的纹理图像映射到32*32像素的空间时，纹理的尺寸变为原始的两倍。默认值为gl.LINEAR。

    缩小方法（gl.TEXTURE_MIN_FILTER）: 当纹理的绘制返回比纹理本身更小时，如何获取纹素颜色。比如说，你将32*32的纹理图像映射到16*16像素空间里，纹理的尺寸就只有原始的一般。默认值为gl.NEAREST_MIPMAP_LINEAR。

    水平填充方法（gl.TEXTURE_WRAP_S）:这个参数表示，如何对纹理图像左侧或右侧区域进行填充。默认值为gl.REPEAT。

    垂直填充方法（gl.TEXTURE_WRAP_T）:这个参数表示，如何对纹理图像上方和下方的区域进行填充。默认值为gl.REPEAT。

    可以赋给gl.TEXTURE_MAP_FILTER和gl.TEXTURE_MIN_FILTER参数的值包括：

    gl.NEAREST: 使用原纹理上距离映射后像素中心最新的那个像素的颜色值，作为新像素的值。

    gl.LINEAR: 使用距离新像素中心最近的四个像素的颜色值的加权平均，作为新像素的值（和gl.NEAREST相比，该方法图像质量更好，但也会有较大的开销。）

    可以赋给gl.TEXTURE_WRAP_S和gl.TEXTURE_WRAP_T的常量：

    gl.REPEAT:平铺式的重复纹理

    gl.MIRRORED_REPEAT:镜像对称的重复纹理

    gl.CLAMP_TO_EDGE:使用纹理图像边缘值

9.gl.texImage2D(target, level, internalformat, format, type, image)

    将image指定的图像分配给绑定到目标上的纹理对象。参数：

    target:gl.TEXTURE_2D或gl.TEXTURE_CUBE

    level:传入0（实际上，该参数是为金字塔纹理准备的）

    internalformat:图像的内部格式

    format:纹理数据格式，必须使用与internalformat相同的值

    type:纹理数据的类型

    image:包含纹理图像的Image对象

    纹理数据格式包含： gl.RGB（红、l绿色、蓝）、gl.RGBA（红、l绿色、蓝、透明度）、gl.ALPHA（0.0， 0.0， 0.0， 透明度）、gl.LUMINANCE、gl.LUMINANCE_ALPHA。

    如果纹理图片是JPG格式，该格式将每个像素用RGB三个分量表示，所以参数指定为gl.RGB。其他格式，例如PNG为gl.RGBA、BMP格式为gl.RGB。

    type参数指定了纹理数据类型，通常我们使用gl.UNSIGNED_BYTE数据类型。所有数据格式如下：

    gl.UNSIGNED_BYTE:无符号整形，每个颜色分量占据1字节

    gl.UNSIGNED_SHORT_5_6_5：RGB每个分量分别占据5、6、5比特

    gl.UNSIGNED_SHORT_4_4_4_:RGBA每个分量分别占据4、4、4、4比特

    gl.UNSIGEND_SHORT_5_5_5_1: RGBA，RGB每个分量个占据5比特，A分量占据1比特

10.专用于纹理的数据类型

    sampler2D:绑定到gl.TEXTURE_2D上的纹理数据类型

    samplerCube:绑定到gl.TEXTURE_CUBE_MAP上的纹理数据类型

11.gl.uniform1i(location, texUnit)

    textUnit单元的纹理传递给着色器。参数：

    location:纹理对象的地址

    texUnit:纹理单元编号

    例如gl.uniform1i(u_Sampler, 0)，将0号纹理传递给着色器中的取样器变量

12.vec4 texture2D(smapler2D sampler, vec2 coord)

    从sampler指定的纹理上获取coord指定的纹理坐标处的像素颜色。参数：

    sampler:指定纹理单元编号

    coord：指定纹理坐标

    返回值：纹理坐标处像素的颜色值，其格式由gl.texImage2D()的inernalformat参数决定。下面列出了不同参数下的返回值。如果由于某些愿意能导致纹理图像不可使用，那就返回（0.0, 0.0, 0.0 1.0）。

   internalformat/返回值

    gl.RGB/(R,G,B,1.0)

    gl.RBGA/(R,G,B,A)

    gl.ALPHA(0.0, 0.0, 0.0, A)

    gl.LUMINANCE/(L, L, L, 1.0)

    gl.LUMINANCE_ALPHA/(L, L, L, A)

13.texImage2D(target, level, internalformat, width, height, border, format, type, offset)

    将image指定的图像分配给绑定到目标上的纹理对象。是WebGL2.0的函数，主要区分WebGL1.0的同名函数区别。参数：
    target:gl.TEXTURE_2D或gl.TEXTURE_CUBE
    level:传入0（实际上，该参数是为金字塔纹理准备的）
    internalformat:图像的内部格式
    width:文理绘制宽度
    height:纹理绘制高度
    format:纹理数据格式，必须使用与internalformat相同的值
    type:纹理数据的类型
    image:包含纹理图像的Image对象


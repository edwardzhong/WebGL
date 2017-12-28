## WebGL Matrix4（4*4矩阵库）
     Matrix4是由<<WebGL编程指南>>作者写的提供WebGL的4*4矩阵操作的方法库，简化我们编写的代码。

    下面罗列了Matrix4库的所有方法：

    1.setIdentity()

        将Matrix4实例初始化为单位阵

    2.setTranslate(x, y, z)

        将Matrix4实例设置为平移变换矩阵，在x轴上平移的距离为x，在y轴上平移的距离为y，在z轴上平移的距离为z

    3.setRotate(angle, x, y, z)

        将Matrix4实例设置为旋转变换矩阵，旋转角度为angle,旋转轴为(x, y, z)。旋转轴(x,y,z)无需归一化

    4.setScale(x, y, z)

        将Matrix4实例设置为缩放变换矩阵，在三个轴上的缩放因子分别为x、y、z

    5.translate(x, y, z)

        将Matrix4实例生意一个平移变换矩阵（该平移矩阵在x轴上的平移距离为x，在y轴上的平移距离为y，在z轴上的平移距离为z），所得到的结果存储在Matrix4中

    6.rotate(angle, x, y, z)

        将Matrix4实例乘以一个旋转变换矩阵（该旋转矩阵旋转的角度为angle，旋转轴为（x、y、z）。旋转轴（x、y、z）无须归一化），所得的记过还存储在Matrix4中

    7.scale(x, y, z)

        将Matrix4实例乘以一个缩放变换矩阵（该缩放矩阵在三个轴上的缩放因子分别为x、y、z。），所得结果还存储在Matrix4中

    8.set( m )

        将Matrix4实例设置为m，m必须也是一个Matrix4实例

    9.elements

        类型化数组(Float32Array)包含了Matrix4实例的矩阵元素

    说明：单位阵在矩阵乘法中的行为，就像数字1在乘法中的行为一样。将一个矩阵生意单位阵，得到的结果和原矩阵完全相同。在单位阵中，对角线的元素为1.0，其余的元素为0.0。

    10. multiply(matrix)

        两个矩阵相乘，返回的结果为一个新的matrix4对象，并且值为两个矩阵相乘的结果。例如：

        var modelViewMatrix = viewMatrix.multiply(modelMatrix);
        
    11.setOrtho(left, right, bottom, top, near, far)

        通过各参数计算正射投影矩阵，将其存储在Matrix4中。注意，left不一定与right相等，bottom不一定与top相等，near与far不相等。参数：

        left、right：指定近裁剪面的左边界和右边界

        bottom、top：指定近裁剪面的上边界和下边界

        near、far：指定近裁剪面和远裁剪面的位置，即可视空间的近边界和远边界

    12.setPerspective(fov, aspect, near, far)

        通过各参数计算透视投影矩阵，将其存储在Matrix4中。注意，near的值必须小于far。参数：

        fov:指定垂直视角，即可视空间顶面和底面键的夹角，必须大于0

        aspect:指定近裁剪面的高宽比（宽度/高度）

        near、far：指定近裁剪面和远裁剪面的位置，即可视空间的近边界和远边界（near和far必须都大于0）

        注意，第二个参数aspect是近裁剪面的宽高比，而不是水平视角（第一个参数是垂直视角）。比如说，如果近裁剪面的高度100和宽度200，那么宽高比为2。

    13.setInverseOf (m)

        使自身成为矩阵m的逆矩阵。

    14.transpose()

        对自身进行转置操作，并将自身设为转置后的结果。
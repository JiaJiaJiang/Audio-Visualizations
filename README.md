#Audio-Visualizations
--------
这是一个使用Web Audio API的音乐可视化演示

## 第二版

#### 旧版已移至old目录

####演示地址：<a href="//luojia.coding.me/Audio-Visualizations/" target="_blank">Audio-Visualizations/</a>


###食用方法

打开演示后点击顶部的按钮选择音乐文件，或者把音乐文件拖放到按钮上。



### 说明

1. 这一个版本简化了整体的动画效果，突出了局部动画。
2. 使用重构过了的canvas库，不会再漏内存了。
3. 此版本不再手动计算节奏，能不能打对节奏还是看运气吧。中间的饼并不代表节奏，虽然一般都会跟着节奏跑。
4. 其实我原本也没想做成这个样子的，但是中间一不小心写了个bug，发现似乎效果还不错？
5. 这个版本对轻音乐有奇效.
6. 可以烤机

#### 使用的库

1. 自制canvas库:CanvasObjLibrary

# 不支持的浏览器

1. IE
2. 不知道


## 文件说明
1. CanvasObjLibrary.js 自制canvas库
2. GraphLib.js COL的外挂简易图形库
3. index.html 项目代码
4. main.js 除可视化效果以外的js逻辑
5. visualization.js 可视化效果类
6. style.css 播放器样式


## 旧版演示地址

1. <a href="//luojia.coding.me/Audio-Visualizations/old/1/" target="_blank">Audio-Visualizations/old/1/</a>
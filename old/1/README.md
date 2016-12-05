#Audio-Visualizations
--------
这是一个使用Web Audio API的音乐可视化演示

#####此项目由之前我做一个<a href="https://go.luojia.me/1x" target="_blank">简易的演示</a>修改而来，此作品添加不少功能和优化性能。

####演示地址：<a href="http://luojia.coding.me/Audio-Visualizations/old/1/" target="_blank">http://luojia.coding.me/Audio-Visualizations/old/1/</a>
#####[备用演示地址](http://dn-luojia.qbox.me/Audio-Visualizations/)，如果上面的演示挂了请看这个

#全屏观看效果更佳！

由于原本只是个demo，所以代码较散乱，请见谅。。

###食用方法

打开演示后点击顶部的按钮选择音乐文件，或者把音乐文件拖放到按钮上。


查看自制Debug:在控制台执行`COL.Debug.on()` ，关闭Debug: `COL.Debug.off()` 。

###注意

* 部分旧版本chrome和opera在一些机器上渲染效果会出现问题，如果你看到了类似升阳战旗的东西，请更新浏览器。
* 节奏判断只用了很简单的算法，所以可能不会有你想象中那么带感，建议使用节奏感特别强的歌曲

####使用的库

1. 自制canvas库:CanvasObjectLibrary
2. 没了

#不支持的浏览器

1. IE
2. 不知道


##文件说明
1. CanvasObjLibrary.js 自制canvas库
2. GraphLib.js COL的外挂简易图形库
3. index.html 项目代码

##使用的HTML5有关API
* WebSocket
* URL API
* Canvas系列API
* AudioContext系列API
* Audio


###介绍一下如何把它玩坏(控制台里输入以下东西)
* COL.autoClear=false
* COL.Debug.on();COL.Debug.eleinfo=true; //体现电脑配置的时候到了
* speed=5
* text.zoom.x=-1;
* text.zoom.y=2;
* cr=2000;
* clearInterval(cctm);setInterval(function(){codingcircle.rotate+=50;},20);
* sidecircletemple.setR(400)

###Debug
* Debug.rawFrequency=true	//显示原始频率分布
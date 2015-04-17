#Audio-Visualizations
--------
这是一个使用Web Audio API的音乐可视化演示

#####此项目由一个月前我闲时做一个简易的演示修改而来
###Coding参赛作品,[这里是投票地址](https://coding.net/event/html5/vote?page=1#http:%2F%2Faudio-visualization.coding.io)
####演示地址：[http://audio-visualization.coding.io/](http://audio-visualization.coding.io/)

#全屏观看效果更佳！

由于原本只是个demo，所以代码较散乱，请见谅。。

###食用方法

打开演示后点击顶部的按钮选择音乐文件，或者把音乐文件拖放到按钮上。


查看自制Debug:在控制台执行`COL.Debug.on()` ，关闭Debug: `COL.Debug.off()` 。

###注意

* 部分旧版本chrome和opera在一些机器上渲染效果会出现问题，如果你看到了类似升阳战旗的东西，请更新浏览器。

####使用的库

1. 自制canvas库:CanvasObjectLibrary
2. 没了

#不支持的浏览器

1. IE
2. 不知道


##文件说明
1. CanvasObjectLibrary.js 自制canvas库
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
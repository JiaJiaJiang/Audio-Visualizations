/*========================init==========================*/
if (!window.AudioContext) {
	window.AudioContext = window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
}

if (! (Audio && AudioContext && FileReader && Uint8Array)) {
	document.write("您的浏览器无法正常查看此演示");
	throw(new Error('API not supported'));
}

var canvas=document.querySelector('canvas'),
	audio = new Audio(),
	visualization=new AudioVisualization(canvas,audio);



window.addEventListener('resize',function(){
	visualization.COL.adjustCanvas();
});

function rand(min, max) {
	return (min + Math.random() * (max - min) + 0.5) | 0;
}
function c_ele(name) {
	return document.createElement(name);
}


/*=======================可视化效果配置======================*/

visualization.setText('Coding',95);
var pie=visualization.pie,ad=document.querySelector('#nya');
//ad.hidden=true;
pie.on('mouseover',function(){
	visualization.COL.canvas.style.cursor='pointer';
});
pie.on('mouseout',function(){
	visualization.COL.canvas.style.cursor='';
});
pie.on('click',function(){
	ad.hidden=!ad.hidden;
});


/*========================音乐控制==========================*/

var playmodesvgs={
	"顺序":'<line stroke-linecap="round" fill="none" x1="7.7777777" x2="31.777779" y1="19.777779" y2="19.777779" stroke="#fff" stroke-width="5"></line><line stroke-linecap="round" fill="none" x1="20.88889" x2="31.88889" y1="8.555555" y2="19.555555" stroke="#fff" stroke-width="5"></line><line stroke-linecap="round" fill="none" x1="21.666664" x2="31.777779" y1="31.14384" y2="19.999998" stroke="#fff" stroke-width="5"></line>',
	"单曲循环":'<rect x="7.111111" y="7.2222223" fill="none" width="25.777779" stroke-linejoin="round" height="25.777779" stroke="#fff" stroke-width="3"></rect><polyline fill="none" stroke-width="3" points="20.222221,27.333334 20.222221,13.111111 15.666667,17.666666" stroke-linejoin="round" stroke-linecap="round" stroke="#fff"></polyline>',
	"随机":'<polyline fill="none" stroke-width="3" points="4.6666656,28.333334 21.56118,11.438817 36.04219,11.438817" stroke-linecap="round" stroke="#fff"></polyline><polyline fill="none" stroke-width="3" transform="matrix(1.0 0.0 0.0 -0.9047619 0.0 56.296295)" points="5.0689154,48.98653 21.963428,32.09201 36.444443,32.09201" stroke-linecap="round" stroke="#fff"></polyline>',
	"列表循环":'<rect x="7.111111" y="7.2222223" fill="none" width="25.777779" stroke-linejoin="round" height="25.777779" stroke="#fff" stroke-width="3"></rect><line stroke-linecap="round" fill="none" x1="13.111112" x2="26.88889" y1="20.222223" y2="20.222223" stroke="#fff" stroke-width="3"></line><line stroke-linecap="round" fill="none" x1="13.111112" x2="26.88889" y1="13.888889" y2="13.888889" stroke="#fff" stroke-width="3"></line><line stroke-linecap="round" fill="none" x1="13.111112" x2="26.88889" y1="26.222221" y2="26.222221" stroke="#fff" stroke-width="3"></line>',
}
var playMode = ["顺序", "单曲循环", "随机", "列表循环"];
var playOption = {
	mode: 0
}
var playmodesvg = document.querySelector("#playMode svg");
var input = document.querySelector("input"),
	msg = document.querySelector("#msg");

var playingid = 0,
	playlist = [];
input.onchange = function(e) {
	var p = false;
	if (playlist.length === 0) p = true;
	loadFileList(input.files);
	if (p) {
		playMusic(0);
	}
}

function loadFileList(fl) {
	for (var i = 0; i < fl.length; i++) {
		if (fl[i].type.match(/^audio/)) {
			playlist.push({
				name: fl[i].name.replace(/\.(?:mp3|ogg|mp4|wav)$/i, ""),
				src: URL.createObjectURL(fl[i])
			});
			setTimeout(addToPlayList, 0, playlist.length - 1);
		}
	}
}



var listtracks = document.querySelectorAll("#list div"),
playlistdom = document.querySelector("#playlist"),
sourceinputdom = document.querySelector("#sourceinput");
function addToPlayList(id) {
	var item = c_ele("span"),
	track = 0,
	trackwidth = [];
	item.className = "listitem";
	item.innerHTML = playlist[id].name;
	item.songid = id;
	for (var qwe = listtracks.length; qwe--;) {
		trackwidth[qwe] = listtracks[qwe].offsetWidth;
	}
	for (var qwe = 0; qwe < trackwidth.length; qwe++) {
		if (trackwidth[qwe] < trackwidth[track]) track = qwe;
	}
	listtracks[track].appendChild(item);
}
function playMusic(ind) {
	if (playlist[ind]) {
		audio.pause();
		audio.src = playlist[ind].src;
		playingid = ind;
		audio.play();
		msg.style.opacity = 0;
		msg.innerHTML = "正在播放:" + playlist[ind].name;
		setTimeout(adjustfontsize, 50, true);
	} else {
		console.log(playlist[ind]);
	}
}

function setmode(m) {
	if (playMode[m]) {
		playmodesvg.innerHTML = playmodesvgs[playMode[m]];
		playOption.mode = m;
	}
}

audio.onended = function() {//播放结束自动下一首
	next();
};
var songlist = document.querySelector("#list");
songlist.addEventListener("click",function(e) {
	var o = e.target;
	if (o.songid >= 0) {
		playMusic(o.songid);
	}
});

var control = document.querySelector("#controls");
control.addEventListener("click",
function(e) {
	if (e.target.parentNode.localName != "div") {
		if (e.target.parentNode.parentNode.localName != "div") {
			console.log("?")
		} else {
			var o = e.target.parentNode.parentNode;
		}
	} else {
		var o = e.target.parentNode;
	}
	switch (o.id) {
		case "pre":{
			pre();
			break;
		}
		case "play":{
			if (audio.paused) audio.play();
			break;
		}
		case "pause":{
			if (!audio.paused) audio.pause();
			break;
		}
		case "next":{
			next();
			break;
		}
		case "songlist":{
			if (playlistdom.style.bottom == "0px") {
				playlistdom.style.bottom='';
			} else {
				playlistdom.style.bottom = "-0px";
			}
			break;
		}
		case "playmode":{
			playOption.mode++;
			if (playOption.mode == 4) playOption.mode = 0;
			setmode(playOption.mode);
			break;
		}
	}
});

function next() {
	switch (playOption.mode) {
		case 0:{
			if (playlist[playingid + 1]) {
				playMusic(playingid + 1);
			}
			break;
		}
		case 1:{
			playMusic(playingid);
			break;
		}
		case 2:{
			playMusic(rand(0, playlist.length - 1));
			break;
		}
		case 3:{
			if (playlist[playingid + 1]) {
				playMusic(playingid + 1);
			} else {
				playMusic(0);
			}
			break;
		}
	}
}
function pre() {
	switch (playOption.mode) {
		case 0:{
			if (playlist[playingid - 1])playMusic(playingid - 1);
			break;
		}
		case 1:{
			audio.seek(0);
			break;
		}
		case 2:{
			playMusic(rand(0, playlist.length - 1));
			break;
		}
		case 3:{
			if (playlist[playingid - 1]) {
				playMusic(playingid - 1);
			} else {
				playMusic(playlist.length - 1);
			}
			break;
		}
	}
}
/*===========================================*/


/*=======================界面控制========================*/
function getfontsize(ele) {
	return ele.style.fontSize = Number(msg.style.fontSize.match(/\d+/));
}
function adjustfontsize(first) {
	var size = getfontsize(msg);
	if (first) {
		msg.style.fontSize = "29px";
		setTimeout(adjustfontsize, 50);
		return;
	}
	if (size < 12) {
		msg.style.opacity = 1;
		return;
	}
	if (msg.offsetWidth > 450 || size > 29) {
		msg.style.fontSize = getfontsize(msg) - 0.2 + "px";
		setTimeout(adjustfontsize, 50);
		return;
	} else if (msg.offsetWidth < 430) {
		msg.style.fontSize = getfontsize(msg) + 0.2 + "px";
		setTimeout(adjustfontsize, 50);
		return;
	}
	msg.style.opacity = 1;
}

//无操作隐藏界面
var ctrlsDom=document.querySelector('#ctrls');
var oprcd = 6;
setInterval(function() {
	if(!visualization.COL.stat.canvasOnover)return;
	if (oprcd < 0) {
		ctrls.hide();
	}
	oprcd--;
},
1000);

var ctrls = {
	hide: function() {
		ctrlsDom.style.opacity = 0;
		setTimeout(function(){
			(oprcd<0)&&(ctrlsDom.hidden=true);
		},550);
	},
	show: function() {
		oprcd = 6;
		ctrlsDom.hidden=false;
		ctrlsDom.style.opacity = '';
	}
}
window.addEventListener("mousemove",function() {
	ctrls.show();
});
window.addEventListener("mousedown",function() {
	ctrls.show();
});

//设置
window.addEventListener("load",
function() {
	if (window.setmode) setmode(0);
});

window.addEventListener("dragover",
function(e) {
	e.dataTransfer.dropEffect = "copy";
	e.stopPropagation();
	e.preventDefault();
});
window.addEventListener("drop",
function(e) {
	e.dataTransfer.dropEffect = "copy";
	e.stopPropagation();
	e.preventDefault();
	var p = false;
	if (playlist.length === 0) p = true;
	loadFileList(e.dataTransfer.files);
	if (p) {
		playMusic(0);
	}
},
false);
/*===========================================*/







/*======================在线人数========================*/
var online = document.querySelector("#onlinenumber");
var OL=new Online('wss://online.luojia.me:8443');
OL.enter('coding:Audio-Visulizations');
OL.onOnlineChange=function(g,n){
	online.innerHTML=Number(n);
}
/*===========================================*/
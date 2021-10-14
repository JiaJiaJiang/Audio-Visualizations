/*========================init==========================*/
if (!window.AudioContext) {
	window.AudioContext = window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
}

if (! (Audio && AudioContext && FileReader && Uint8Array)) {
	document.write("您的浏览器无法正常查看此演示");
	throw(new Error('API not supported'));
}

var ele_canvas=document.querySelector('canvas'),
	audio = new Audio(),
	visualization=new AudioVisualization(ele_canvas,audio),
	musicNode=visualization.audioCtx.createMediaElementSource(audio);

function events(target,events){//add events
	if(!Array.isArray(target))target=[target];
	for(let e in events)
		e.split(/\,/g).forEach(function(e2){
			target.forEach(function(t){
				t.addEventListener(e2,events[e])
			});
		});
}
function rand(min, max) {//random in range
	return (min + Math.random() * (max - min) + 0.5) | 0;
}
function c_ele(name) {//create element
	return document.createElement(name);
}



/*=======================可视化效果配置======================*/

/*visualization.setText('Coding',95);
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
});*/


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
var ele_playmodesvg = document.querySelector("#playMode svg");
var ele_fileInput = c_ele("input"),
	ele_playing = document.querySelector("#playing"),
	ele_playlist = document.querySelector("#playlist"),
	ele_ctrls = document.querySelector("#ctrls"),
	ele_control = document.querySelector("#controls");

var playingInd = 0,
	playlist = [];
ele_fileInput.type='file';
events(ele_fileInput,{
	change:e=>{
		var p = false;
		if(playlist.length === 0) p = true;
		loadFileList(ele_fileInput.files);
		if(p) {
			playMusic(0);
		}
	}
});


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
function addToPlayList(id) {
	let item = c_ele("div");
	item.innerText = playlist[id].name;
	item.songid = id;
	ele_playlist.appendChild(item);
}
function playMusic(ind) {
	if (playlist[ind]) {
		audio.pause();
		audio.src = playlist[ind].src;
		playingInd = ind;
		audio.play();
		ele_playing.style.opacity = 0;
		ele_playing.innerHTML = playlist[ind].name;
		setTimeout(adjustfontsize, 50, true);
	} else {
		console.log(playlist[ind]);
	}
}
function setmode(m) {
	if (playMode[m]) {
		ele_playmodesvg.innerHTML = playmodesvgs[playMode[m]];
		playOption.mode = m;
	}
}

events(ele_playlist,{
	click:e=>{
		var o = e.target;
		if (o.songid >= 0) {
			playMusic(o.songid);
		}
	}
})

events(ele_control,{
	click:e=>{
		let o=e.target;
		while(o.localName != "div")
			o=o.parentNode;

		switch (o.id) {
			case "pre":
				preSong();break;
			case "play":
				if (audio.paused) audio.play();break;
			case "pause":
				if (!audio.paused) audio.pause();break;
			case "next":
				nextSong();break;
			
			case "playmode":
				playOption.mode++;
				if (playOption.mode == 4) playOption.mode = 0;
				setmode(playOption.mode);
				break;
		}
	}
});

function nextSong() {
	switch (playOption.mode) {
		case 0:
			if (playlist[playingInd + 1]) {
				playMusic(playingInd + 1);
			}
			break;
		case 1:
			playMusic(playingInd);break;
		case 2:
			playMusic(rand(0, playlist.length - 1));break;
		case 3:
			if (playlist[playingInd + 1]) {
				playMusic(playingInd + 1);
			} else {
				playMusic(0);
			}
			break;
	}
}
function preSong() {
	switch (playOption.mode) {
		case 0:
			if (playlist[playingInd - 1])playMusic(playingInd - 1);
			break;
		case 1:
			audio.seek(0);break;
		case 2:
			playMusic(rand(0, playlist.length - 1));break;
		case 3:
			if (playlist[playingInd - 1]) {
				playMusic(playingInd - 1);
			} else {
				playMusic(playlist.length - 1);
			}
			break;
	}
}
/*===========================================*/

/*=======================音频源控制======================*/
events(sources,{
	change:e=>{
		if(sources.source.value==='mic'){
			setSource('mic');
		}else{
			setSource('music');
		}
	}
});
let unsetSource;
function setSource(s){
	if(unsetSource)unsetSource();
	switch(s){
		case 'mic':
			location.hash='';
			ele_ctrls.classList.add('micMode');
			visualization.toDestination(false);
			navigator.mediaDevices.getUserMedia({audio:true})
			.then(function(micMediaStream){
				let ms=visualization.audioCtx.createMediaStreamSource(micMediaStream);
				visualization.setSource(ms);
				console.log('tracks',micMediaStream.getTracks());
				unsetSource=()=>{
					visualization.setSource();
					for(let t of micMediaStream.getTracks()){
						t.stop();
					}
					unsetSource=null;
				}
			}).catch(function(err) {
				console.log(err);
				alert('Cannot get media stream, please check your settings.Or your browser requires a secure context to get the media.');
			});
			break;
		case 'music':
			location.hash='#mode=music';
			visualization.toDestination(true);
			ele_ctrls.classList.remove('micMode');
			visualization.setSource(musicNode);
			unsetSource=()=>{
				audio.pause();
				visualization.setSource();
			}
			break;
	}
}

/*=======================界面控制========================*/
function getfontsize(ele) {
	return ele.style.fontSize = Number(ele_playing.style.fontSize.match(/\d+/));
}
function adjustfontsize(first) {
	var size = getfontsize(ele_playing),
		maxW=ele_playing.parentNode.offsetWidth,
		maxH=ele_playing.parentNode.offsetHeight,
		W=ele_playing.offsetWidth,
		H=ele_playing.offsetHeight;
	if (first) {
		ele_playing.style.fontSize = maxH+"px";
		setTimeout(adjustfontsize, 50);
		return;
	}
	if (size < 12) {
		ele_playing.style.opacity = 1;
		return;
	}
	if (W > maxW || H > maxH) {
		ele_playing.style.fontSize = (size - 0.2) + "px";
		setTimeout(adjustfontsize, 50);
		return;
	} /*else if (W < maxW && H < maxH) {
		ele_playing.style.fontSize = (size + 0.2 )+ "px";
		setTimeout(adjustfontsize, 50);
		return;
	}*/
	ele_playing.style.opacity = 1;
}

//点击画布显隐控制

var ctrls = {
	hide: function() {
		// ele_ctrls.style.display='none';
		/*ctrlsDom.style.opacity = 0;
		setTimeout(function(){
			(oprcd<0)&&(ctrlsDom.hidden=true);
		},550);*/
	},
	show: function() {
		// ele_ctrls.style.display='';

		/*oprcd = 6;
		ctrlsDom.hidden=false;
		ctrlsDom.style.opacity = '';*/
	}
}



events(ele_canvas,{
	click:e=>{
		ele_ctrls.classList.toggle('hide');
	}
})

/*===========================================*/


/*=====================其它事件======================*/
events(window,{
	resize:e=>visualization.resetCanvas(),
	mousedown:visualization.audioCtx.resume(),
	mouseup:visualization.audioCtx.resume(),
	load:e=>{
		if (window.setmode) setmode(0);
	},
	dragover:e=>{
		e.dataTransfer.dropEffect = "copy";
		e.stopPropagation();
		e.preventDefault();
	},
	drop:e=>{
		visualization.audioCtx.resume();
		e.dataTransfer.dropEffect = "copy";
		e.stopPropagation();
		e.preventDefault();
		var p = false;
		if (playlist.length === 0) p = true;
		loadFileList(e.dataTransfer.files);
		if (p) {
			if(ele_ctrls.classList.contains('micMode')){
				dom_sourceMusic.click();
			}
			playMusic(0);
		}
	}
});
var ele_playButton = document.querySelector("#control_buttons #play"),
	ele_pauseButton = document.querySelector("#control_buttons #pause");

events(audio,{
	ended:()=>nextSong(),//播放结束自动下一首
	playing:()=>{
		console.log(123);
		ele_playButton.style.display='none';
		ele_pauseButton.style.display='';
	},
	pause:()=>{
		console.log(456);
		ele_playButton.style.display='';
		ele_pauseButton.style.display='none';
	}
});
/*===========================================*/


requestAnimationFrame(()=>{
	if(location.hash.match('mode=music')){
		dom_sourceMusic.click();
		ele_canvas.click();
	}else{
		dom_sourceMic.click();
		ele_canvas.click();
	}
});

(function drawLoop(){
	requestAnimationFrame/*&&setTimeout*/(()=>{
		visualization.draw();
		drawLoop();
	},50);
})();


/*======================在线人数========================*/
/*var online = document.querySelector("#onlinenumber");
var OL=new Online('wss://online.luojia.me/online');
OL.enter('coding:Audio-Visulizations');
OL.onOnlineChange=function(data){
	online.innerHTML=Number(data.u);
}*/
/*===========================================*/
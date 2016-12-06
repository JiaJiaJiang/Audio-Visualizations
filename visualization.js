(function(){
function To(origin, to, speed) {
	return origin + (to - origin) *  speed;
}
function rand(min, max) {
	return (min + Math.random() * (max - min) + 0.5) | 0;
}


//class:AudioVisualization
function AudioVisualization(canvas,audio){
	if(this instanceof AudioVisualization ===false)
		throw(new Error('this is a constructor,new required.'));

	var visualization=this;
	/*prepare data source*/
	this.audio=audio;
	this.audioCtx = new window.AudioContext();
	this.audioSourceNode = this.audioCtx.createMediaElementSource(audio);
	this.analyser=this.audioCtx.createAnalyser();
	this.gainNode = this.audioCtx.createGain();
	this.audioSourceNode.connect(this.analyser);
	this.audioSourceNode.connect(this.gainNode);
	this.gainNode.connect(this.audioCtx.destination);
	this.analyser.fftSize=1024;


	/*vars*/
	var COL=this.COL=new CanvasObjLibrary(canvas),
		GLib=new GraphLib(COL);
	var frequencyArray=new Uint8Array(this.analyser.frequencyBinCount),
		waveArray=new Float32Array(this.analyser.fftSize/2);

	frequencyArray.fill(511);

	this.frequencyDebug=false;

	COL.root.onoverCheck=false;

	/*graphs*/
	//wave
	var waveGraph=new COL.class.FunctionGraph();
	waveGraph.onoverCheck=false;
	waveGraph.drawer=function(ct){
		ct.beginPath();
		ct.strokeStyle = "rgba(52, 52, 52, 0.7)";
		ct.lineWidth = 1.5;
		ct.moveTo(0,100*waveArray[0]);
		var distance=waveArray.length/canvas.width;
		for (var i = 1; i < waveArray.length; i++) {
			ct.lineTo(i/distance,100*waveArray[i]);
		}
		ct.lineTo(canvas.width,100*waveArray[waveArray.length]);
		ct.stroke();
	}
	COL.root.appendChild(waveGraph);


	//frequency
	var freFrame=new COL.class.FunctionGraph();
	Object.assign(freFrame.style,{
		width:0,
		height:0,
	});
	freFrame.onoverCheck=false;
	COL.root.appendChild(freFrame);

	var freTemplate=new COL.class.FunctionGraph();
	freTemplate.onoverCheck=false;
	freTemplate.start=0;
	freTemplate.end=0;
	freTemplate.color=null;
	freTemplate.base=200;
	freTemplate.distance=1;
	freTemplate.reduceFirst=1;
	freTemplate.reduce=1;
	freTemplate.drawer=function(ct){
		ct.beginPath();
		ct.strokeStyle = this.color;
		ct.lineWidth = 1.5;
		var s=this.start,f,l,
			centerV=(frequencyArray[this.start]+frequencyArray[this.end])/2;
		for (var i = this.start; i <= this.end; i++) {
			f=(this.start===i);
			l=(this.base+To(frequencyArray[i]*(f?this.reduceFirst:1),centerV,this.toCenterRate||0))*this.reduce;
			ct[f?'moveTo':'lineTo'](
				l*Math.sin(i*this.distance),
				-l*Math.cos(i*this.distance)
			);
		}
		this.closePath&&ct.closePath();
		if(this.fillColor){
			ct.fillStyle=this.fillColor;
			ct.fill();
		}
		if(this.color){
			ct.strokeStyle=this.fillColor;
			ct.stroke();
		}
	}

	var fre1=this.fre1=freTemplate.createShadow();
	fre1.color='#353535';
	fre1.distance=1.4609989999;
	fre1.start=14;
	fre1.end=100;
	fre1.reduce=0.85;
	fre1.reduceFirst=0.6;
	fre1.closePath=false;
	fre1.base=240;
	fre1.style.opacity=0.4;
	fre1.toCenterRate=0.4;
	fre1.hidden=true;
	freFrame.appendChild(fre1);

	var fre2=this.fre2=freTemplate.createShadow();
	//fre2.color='red';
	fre2.start=101;
	fre2.end=240/*300*/;
	fre2.distance=/*1.4249999*/ 2*Math.PI/(fre2.end-fre2.start+1);
	fre2.reduce=1.2;
	fre2.style.opacity=0.06;
	//fre2.reduceFirst=0.5;
	fre2.toCenterRate=0.7/*0.74*/;
	fre2.base=225;
	//fre2.style.rotate=180;
	//fre2.style.composite='darker';
	fre2.fillColor='#353535';
	fre2.insertBefore(fre1);

	var fre3=this.fre3=freTemplate.createShadow();
	fre3.color='#c3790b'/*'#353535'*/;
	fre3.start=301;
	fre3.end=435;
	fre3.distance=/*2*Math.PI/(fre3.end-fre3.start+1)*/0.6;
	fre3.reduce=1.18;
	fre3.toCenterRate=0.74;
	fre3.style.opacity=0.16;
	//fre3.fillColor='#353535'/*'rgb(235,234,230)'*/;
	//fre3.style.rotate=180;
	fre3.base=225;
	fre3.insertBefore(fre2);


	//pie
	var pie=this.pie=new GLib.pie();
	pie.setRadius(185);
	pie.color='#fff';
	pie.style.setPositionPoint('center');
	pie.style.setZoomPoint('center');
	pie.onoverCheck=true;
	pie.borderWidth=4;
	freFrame.appendChild(pie);

	var pie2=new GLib.pie();
	pie2.setRadius(205);
	pie2.color='#353535';
	pie2.style.opacity=0.2;
	pie2.style.setPositionPoint('center');
	pie2.style.setZoomPoint('center');
	pie2.onoverCheck=false;
	//pie2.borderWidth=4;
	pie2.insertBefore(pie);

	//text
	var text=this.text=new COL.class.TextGraph();
	text.onoverCheck=false;
	text.font.fontWeight=600;
	text.font.color="#353535";
	text.style.opacity=0;
	text.style.position(pie.style.width/2,pie.style.height/2);
	pie.appendChild(text);
	setTimeout(function(){
		text.style.setPositionPoint('center');
		var i=setInterval(function(){
			if(text.style.opacity<1){
				text.style.opacity+=0.1;
			}else{
				clearInterval(i);
			}
		},30);
	},200);


	//bottom
	var buttomFre=new COL.class.FunctionGraph();
	buttomFre.onoverCheck=false;
	buttomFre.drawer=function(ct){
		//ct.beginPath()
		ct.fillStyle='rgba(0,0,0,0.08)';
		var s=1,e=fre1.start-1,W=COL.canvas.width/(e-s+1),
			h=COL.canvas.height;
		for(var i=0;i<=e-s;i++){
			ct.rect(i*W,h-frequencyArray[i+s],W,frequencyArray[i+s]);
		}
		ct.fill();
	};
	buttomFre.insertAfter(waveGraph);


	function resetGraphs(){
		console.log('reset graphs');
		waveGraph.style.size(canvas.width,1);
		waveGraph.style.y=canvas.height/2;

		freFrame.style.position(canvas.width/2,canvas.height/2);
		//console.log(canvas.width/2,canvas.height/2)

		text.style.setPositionPoint('center');

		//center fre zoom
		//console.log(Math.min(canvas.width,canvas.height)/953)
		freFrame.style.zoom(Math.min(canvas.width,canvas.height)/953);
	}
	this.resetGraphs=resetGraphs.bind(this);
	resetGraphs();


	/*size change*/
	/*reset graphs*/
	COL.root.on('resize',function(){
		resetGraphs();
	});
	
	function drawFrequencyDebug(){
		var ct=visualization.COL.context;
		ct.fillStyle='rgba(0,0,0,0.6)';
		var W=COL.canvas.width/frequencyArray.length,
			h=COL.canvas.height;
		for(var i=frequencyArray.length;i--;){
			ct.rect(i*W,h-frequencyArray[i],W,frequencyArray[i]);
		}
		ct.fill();
	}

	//when paused
	var offset=fre2.start;
	function ooooops(){
		/*for(var t=;t<=fre2.end;t++){
			if(t>=fre2.start && t<= fre2.end){}
			frequencyArray[t]=To(frequencyArray[t],0,0.07);
		}*/
		frequencyArray[offset++]=50;
		if(offset>fre2.end)offset=fre2.start;
		//if(frequencyArray[fre3.end]>0){
			for(var b=frequencyArray.length;b--;){
				frequencyArray[b]=To(frequencyArray[b],0,0.05);
			}
		//}
		
	}

	/*start anime*/
	function anime(){
		//设置一下圆圈的缩放
		fre2.style.rotate-=0.14;
		fre1.distance-=0.00005*frequencyArray[0]/120;
		fre3.distance+=0.00001;
		audio.paused&&ooooops();
		pie.style.zoom(1+Math.pow((frequencyArray[5]+frequencyArray[0])>>1,4)/9500000000);
		pie2.style.zoom(To(pie2.style.zoomX,pie.style.zoomX,0.1));
		fre3.style.opacity=frequencyArray[fre3.start]/700;
		fre1.style.opacity=0.1+frequencyArray[fre1.start]/673;
		COL.draw();
		if(visualization.frequencyDebug)drawFrequencyDebug();
		requestAnimationFrame(anime);
		if(!audio.paused){
			visualization.getWaveyData(waveArray);
			visualization.getFrequencyData(frequencyArray);
		}
	}
	anime();
	//COL.debug.on();
}
AudioVisualization.prototype.setText=function(text,size){
	this.text.text=text;
	this.text.font.fontSize=size||30;
	this.text.prepare();
	this.resetGraphs();
}
AudioVisualization.prototype.getFrequencyData=function(array){
	this.analyser.getByteFrequencyData(array);
}
AudioVisualization.prototype.getWaveyData=function(array){
	this.analyser.getFloatTimeDomainData(array);
}
window.AudioVisualization=AudioVisualization;
})();

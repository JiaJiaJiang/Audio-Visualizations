/*
copyright 2019 luojia@luojia.me
*/
(function(){
function rand(min, max) {
	return Math.round(min+Math.random()*(max-min));
}


//class:AudioVisualization
class AudioVisualization{
	audioCtx;
	analyser;
	glData={
		circleVertex:null,//float32array data for drawing circles
		baseColor:new Float32Array([.1,.3,.4,1]),//float32array base color for the pies
		// circleLight,//float32array light for circles
		// circleSize,//float32array size factor for circles
		circleCount:64,//circles to draw
		circleIndex:null,
		sceneMatrix:Mat.Identity(4),//scene
		// cameraMatrix:new Float32Array([0,0,-1]);
	}
	audioData={
		frequencyArray:new Float32Array(this.glData.circleCount),//Uint8Array
		// waveArray,//Float32Array
	}
	mats={
		perspectiveMatrix:Mat.Perspective(45,1,0.001,10),//perspective
		rotateMatrix:Mat.Identity(4).rotate3d(-Math.PI/4,0,0),
		translateMatrix:Mat.Identity(4).translate3d(0,-0.2,1),
		whScaleMatrix:Mat.Identity(4),
		// identity:Mat.Identity(4),
	}
	glRoom;
	program;
	_source;
	constructor(canvas){
		this.canvas=canvas;
		this.initAudioCtx();
		this.glRoom=new GLRoom(canvas);
		this.initGL();
		this.resetCanvas();
		this.initData();
		// this.setSource(source);
	}
	shaders={
		vert:[WebGL2RenderingContext.VERTEX_SHADER,`
			#version 300 es
			#pragma optimize(on)
			precision mediump float;
			in float a_circleIndex;
			in float a_light;
			in vec2 a_circleVertex;
			uniform float u_circleCount;
			uniform mat4 u_sceneMatrix;

			out float v_light;

			void main(void) {
				float addition=(1.0-0.3)/u_circleCount;
				float size=0.3+a_circleIndex*addition;
				gl_Position = u_sceneMatrix*vec4(a_circleVertex.xy*size,
						(a_circleIndex-u_circleCount/2.0)/300.0,
						1);
				v_light=pow(a_light,1.5);
			}`
		],
		frag:[WebGL2RenderingContext.FRAGMENT_SHADER,`
			#version 300 es
			#pragma optimize(on)
			precision mediump float;
			in float v_light;
			uniform vec4 u_baseColor;
			out vec4 color;

			void main(void) {
				color=
				vec4(
					(1.0-u_baseColor.rgb)*v_light+u_baseColor.rgb,
					1.0
				);
			}`
		],
	}
	initAudioCtx(){
		if(!window.AudioContext){
			alert('Your Broswer dose not support web audio api');
			throw('not support');
		}
		this.audioCtx = new window.AudioContext();
		this.analyser=this.audioCtx.createAnalyser();
		this.analyser.fftSize=this.glData.circleCount*2;
		this.audioNode = this.audioCtx.createGain();
		
		this.audioNode.connect(this.analyser);

		// this.audioData.waveArray=new Float32Array(this.analyser.fftSize/2);
	}
	toDestination(s){
		if(s===true){
			try{
				this.audioNode.connect(this.audioCtx.destination);
			}catch(e){}
		}else if(s===false){
			try{
				this.audioNode.disconnect(this.audioCtx.destination);
			}catch(e){}
		}
	}
	setSource(s){
		if(this._source)
			this._source.disconnect(this.audioNode);
		if(!s){
			this._source=null;return;
		}
		s.connect(this.audioNode);
		this._source=s;
	}
	refreshAudioData(){
		this.analyser.getFloatFrequencyData(this.audioData.frequencyArray);

		for(let i=0;i<this.audioData.frequencyArray.length;i++){
			this.audioData.frequencyArray[i]=AudioVisualization.freValueScale(this.audioData.frequencyArray[i]);
		}

	}
	initGL(){
		let canvas=this.canvas,
			glRoom=this.glRoom,
			gl=glRoom.gl;
		// glRoom.createProgram('circles',this.shaders);

		//get locations
		
		this.program=glRoom.createProgram('circles',this.shaders)
		.cacheUniformLocation([//uniforms
			//'u_sceneMatrix',
			'u_circleCount',
			'u_baseColor',
			'u_sceneMatrix',
			// 'u_whScale',
			// 'u_rotateMatrix',
			// 'u_translateMatrix',
		]).cacheAttributeLocation([//attributes
			'a_light',
			'a_circleVertex',
			'a_circleIndex',
		]);
		glRoom.createBuffer([
			'circleVertexBuffer',
			'circleIndexBuffer',
			'circleLightBuffer',
		]).clearColor(187/255, 193/255, 193/255, 1.0);
		gl.enable(gl.DEPTH_TEST);
		/*.enable('BLEND')*/;//bg color

		gl.enable(gl.BLEND);
		// gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA ,gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

		
	}
	getFrequencyData(){
		this.analyser.getFloatFrequencyData(array);
	}
	/*getWaveData(array){
		this.analyser.getFloatTimeDomainData(array);
	}*/
	_pieVertex(R){
		let minR=R-3,
			addRad=Math.acos(minR/R),
			pointCount=Math.ceil(Math.PI*2/addRad),
			rad=0,
			points=new Float32Array(pointCount*2);
		addRad=Math.PI*2/pointCount;
		for(;pointCount--;rad+=addRad){
			points[pointCount*2]=Math.sin(rad);
			points[pointCount*2+1]=Math.cos(rad);
		}
		return points;
	}
	resetCanvas(){//called for every resizing event
		let [W,H]=[this.canvas.offsetWidth,this.canvas.offsetHeight];

		//reset circle vertex array
		let maxR=Math.sqrt(W*W+H*H)/2;//radius of the biggest circle
		let glRoom=this.glRoom,
			p=this.program,
			gl=glRoom.gl;
		glRoom.resizeCanvas();
		this.glData.circleVertex=this._pieVertex(maxR);
		glRoom.VAO('circle',()=>{
			//reset circle vertex
			glRoom.buffer('circleVertexBuffer',gl.ARRAY_BUFFER,this.glData.circleVertex,gl.STATIC_DRAW);
			gl.vertexAttribPointer(p.a.a_circleVertex,2,gl.FLOAT,false,0,0);//fill vertex data of the circle
		});
		gl.viewport(0,0,W,H);

		//reset alex scale
		let maxA=Math.max(W,H);
		Mat.scale3d(Mat.Matrixes.I4,maxA/W,maxA/H,1,this.mats.whScaleMatrix);
		
		// [...this.mats.whScaleMatrix.array]=[maxA/W,maxA/H,1,1];
		// gl.uniform2fv(p.u.u_whScale,this.glData.whScale);
	}
	initData(){//one time init
		let glRoom=this.glRoom,
			gl=glRoom.gl,
			p=this.program,
			count=this.glData.circleCount;
		// let shaderProgram=this.shaderProgram;
		
		//data
		gl.uniform4fv(p.u.u_baseColor,this.glData.baseColor);
		gl.uniform1f(p.u.u_circleCount,this.glData.circleCount);

		this.glData.circleIndex=new Float32Array(count);//circle index
		for(let i=count;i--;){//generate index
			this.glData.circleIndex[i]=i;
		}

		//set scene matrix
		// gl.uniformMatrix4fv(p.u.u_sceneMatrix,true,this.glData.sceneMatrix.array);
		// gl.uniformMatrix4fv(p.u.u_rotateMatrix,true,this.glData.rotateMatrix.array);
		// gl.uniformMatrix4fv(p.u.u_translateMatrix,true,this.glData.translateMatrix.array);
		this.canvas.addEventListener('mousemove',e=>{//follow mouse
			let Ry=(e.offsetX-this.canvas.width/2)/this.canvas.width*this.mats.whScaleMatrix.array[1],
				Rx=(e.offsetY-this.canvas.height/2)/this.canvas.height*this.mats.whScaleMatrix.array[0];
			Mat.rotate3d(Mat.Matrixes.I4,Rx/2-Math.PI/4,Ry/2,0,this.mats.rotateMatrix);
			// gl.uniformMatrix4fv(p.u.u_rotateMatrix,false,this.glData.rotateMatrix.array);
			
		});

		//circle vao
		glRoom.VAO('circle',()=>{
			//vertex
			gl.enableVertexAttribArray(p.a.a_circleVertex);
			glRoom.buffer('circleVertexBuffer',gl.ARRAY_BUFFER);
			gl.vertexAttribPointer(p.a.a_circleVertex,2,gl.FLOAT,false,0,0);

			//circle index data
			gl.enableVertexAttribArray(p.a.a_circleIndex);
			glRoom.buffer('circleIndexBuffer',gl.ARRAY_BUFFER,this.glData.circleIndex,gl.STATIC_DRAW);
			gl.vertexAttribPointer(p.a.a_circleIndex,1,gl.FLOAT,false,0,0);
			gl.vertexAttribDivisor(p.a.a_circleIndex,1);

			//light buffer
for(let i=0;i<this.audioData.frequencyArray.length;i++){
	this.audioData.frequencyArray[i]=i/this.audioData.frequencyArray.length;
}
			gl.enableVertexAttribArray(p.a.a_light);
			glRoom.buffer('circleLightBuffer',gl.ARRAY_BUFFER);
gl.bufferData(gl.ARRAY_BUFFER,this.audioData.frequencyArray,gl.STREAM_DRAW);
			gl.vertexAttribPointer(p.a.a_light,1,gl.FLOAT,false,0,0);
			gl.vertexAttribDivisor(p.a.a_light,1);
		});
		
// glRoom.buffer('circleLightBuffer',gl.ARRAY_BUFFER,this.audioData.frequencyArray,gl.STREAM_DRAW);
	}
	draw(){
		let glRoom=this.glRoom,
			gl=glRoom.gl,
			p=this.program,
			glData=this.glData,
			mats=this.mats;
		// this.refreshAudioData();//get new fre data


		glData.sceneMatrix.set(Mat.Matrixes.I4);
		glData.sceneMatrix.leftMultiply(mats.rotateMatrix)
							.leftMultiply(mats.translateMatrix)
							.leftMultiply(mats.perspectiveMatrix)
							.leftMultiply(mats.whScaleMatrix);
		gl.uniformMatrix4fv(p.u.u_sceneMatrix,true,glData.sceneMatrix.array);

		//GL
		gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		
		glRoom.VAO('circle',()=>{
			//realtime data
			//frequency energy => light
			glRoom.buffer('circleLightBuffer',gl.ARRAY_BUFFER,this.audioData.frequencyArray,gl.STREAM_DRAW);

			gl.drawArraysInstanced(gl.TRIANGLE_FAN,0,this.glData.circleVertex.length/2,this.glData.circleCount);
		});
	}
	static freValueScale(raw){
		const min=-150.0,max=-20.0;
		raw=(raw-max)/(min-max);
		if(raw>1.0)raw=1.0;
		else if(raw<0.0)raw=0.0;
		return Math.pow((1.0-raw),2.9);
	}
}






	

// var preFres=new Uint8Array(7),freModCount=0,freSum;
// /*start anime*/
// function anime(){
// 	for(let i=0;i<preFres.length;i++)preFres[i]=frequencyArray[i];
// 	freSum=freModCount=0;
// 	if(!audio.paused){
// 		visualization.getFrequencyData(frequencyArray);
// 	}
// 	// visualization.getWaveyData(waveArray);
// 	for(let pfi=0;pfi<preFres.length;pfi++){
// 		if(Math.abs(preFres[pfi],frequencyArray[pfi])>=3){
// 			freModCount++;
// 			freSum+=preFres[pfi];
// 		}
// 	}

// 	fre2.offsetDeg+=0.004;
// 	if(frequencyArray[0]>180){
// 		fre1.offsetDeg+=0.004*frequencyArray[0]/160;
// 		fre1_2.offsetDeg-=0.004*frequencyArray[0]/160;
// 	}
// 	fre1_2.style.opacity=frequencyArray[3]/1800;
// 	audio.paused&&ooooops();

// 	//设置一下圆圈的缩放
// 	freModCount&&pie.style.zoom(1+Math.pow(freSum/freModCount,3)/33162750);
// 	pie2.style.zoom(To(pie2.style.zoomX,pie.style.zoomX,0.2));
// 	fre1.style.opacity=0.1+frequencyArray[fre1.start]/673;

// 	//环缩放
// 	var s3=0;
// 	for(var fre3i=300;fre3i<=420;fre3i++)s3+=frequencyArray[fre3i];
// 	ring.style.zoom(1.3+s3/30600);

// 	COL.draw();
// 	if(visualization.frequencyDebug)drawFrequencyDebug();
// 	requestAnimationFrame(anime);
// }
// anime();

window.AudioVisualization=AudioVisualization;
})();

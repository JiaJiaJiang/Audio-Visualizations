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
		baseColor:new Float32Array([.3,0.5,.6,1]),//float32array base color for the pies
		// circleLight,//float32array light for circles
		// circleSize,//float32array size factor for circles
		circleCount:128,//circles to draw
		circleIndex:null,
		sceneMatrix:new Mat(4,4,[1,0,0,0,
								0,1,0,0,
								0,0,1,0,
								0,0,.5,0])||Mat.Perspective(90,1,0.1,10),//scene
		rotateMatrix:Mat.Identity(4),
		// cameraMatrix:new Float32Array([0,0,-1]);
	}
	vao={
		circle:null,//circle vertex array object
	}
	glValue={
		u_sceneMatrix:null,
		u_baseColor:null,
		u_circleCount:null,
		u_resolution:null,
		u_rotateMatrix:null,
		a_light:null,
		a_circleVertex:null,
		a_circleIndex:null,
	}
	glBuffer={
		circleVertexBuffer:null,
		circleLightBuffer:null,
		// circleSizeBuffer:null,
		circleIndexBuffer:null,
	}
	audioData={
		frequencyArray:new Float32Array(this.glData.circleCount),//Uint8Array
		// waveArray,//Float32Array
	}
	mat={
		identity:Mat.Identity(4),
	}
	glRoom;
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
			uniform vec2 u_whScale;
			uniform mat4 u_sceneMatrix;
			uniform mat4 u_rotateMatrix;

			out float v_light;

			void main(void) {
				float addition=(1.0-0.2)/u_circleCount;
				float size=0.2+a_circleIndex*addition;
				float z=1.0-size;
				gl_Position = vec4(u_whScale.x,u_whScale.y,1.0,1.0) 
				* (/*u_sceneMatrix **/ u_rotateMatrix *  vec4(
						a_circleVertex.x/**size*/,
						a_circleVertex.y/**size*/,
						z/.5,
						2));
				v_light=a_light;
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
					(1.0-u_baseColor.r)*v_light+u_baseColor.r,
					(1.0-u_baseColor.g)*v_light+u_baseColor.g,
					(1.0-u_baseColor.b)*v_light+u_baseColor.b,
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
			glRoom=this.glRoom;
		let gl=this.gl=canvas.getContext('webgl2');
		if(!gl){
			alert('Your broswer dosn\'t support WebGL2');
			throw('not supported');
		}
		glRoom.program('circles',this.shaders);
		glRoom.program('circles');//use it
		/*let vertexShader = this.shader("vert");
		let fragmentShader = this.shader("frag");
		let shaderProgram = this.shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram,fragmentShader);
		gl.attachShader(shaderProgram,vertexShader);
		gl.linkProgram(shaderProgram);
		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			let info = gl.getProgramInfoLog(shaderProgram);
			console.error("Unable to initialize the shader program:\n",info);
			throw('Error in shader program');
			return;
		}*/
		// gl.useProgram(shaderProgram);

		// gl.disable(gl.CULL_FACE);
// gl.frontFace(gl.CW);

		//get locations
		//uniforms
		for(let u of [
			'u_sceneMatrix',
			'u_circleCount',
			'u_baseColor',
			'u_whScale',
			'u_rotateMatrix',
		])this.glValue[u]=gl.getUniformLocation(shaderProgram,u);

		//attributes
		for(let a of [
			'a_light',
			'a_circleVertex',
			'a_circleIndex',
		])console.log('attr index',a,':',this.glValue[a]=gl.getAttribLocation(shaderProgram,a));

		//buffers
		this.glBuffer.circleVertexBuffer=gl.createBuffer();
		this.glBuffer.circleIndexBuffer=gl.createBuffer();
		this.glBuffer.circleLightBuffer=gl.createBuffer();
		// this.glBuffer.circleSizeBuffer=gl.createBuffer();

		//bg color
		gl.clearColor(187/255, 193/255, 193/255, 1.0);
		// gl.enable(gl.BLEND);
		// gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA ,gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

		
	}
	shader(name){//create shader
		let gl=this.gl,
			s=gl.createShader(this.shaders[name][0]);
		gl.shaderSource(s,this.shaders[name][1].trim());
		console.log('complie shader:',name);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s,gl.COMPILE_STATUS))
			throw("An error occurred compiling the shaders: " + gl.getShaderInfoLog(s));
		return s;
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
		[this.canvas.width,this.canvas.height]=[W,H];

		//reset circle vertex array
		let maxR=Math.sqrt(W*W+H*H)/2;//radius of the biggest circle
		let gl=this.gl;
		this.glData.circleVertex=this._pieVertex(maxR);
		this.VAO(this.vao.circle,()=>{
			//reset circle vertex
			gl.bindBuffer(gl.ARRAY_BUFFER,this.glBuffer.circleVertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER,this.glData.circleVertex,gl.STATIC_DRAW);
			gl.vertexAttribPointer(this.glValue.a_circleVertex,2,gl.FLOAT,false,0,0);//fill vertex data of the circle
		});
		gl.viewport(0,0,W,H);

		//reset alex scale
		let maxA=Math.max(W,H);
		gl.uniform2fv(this.glValue.u_whScale,new Float32Array([maxA/W,maxA/H]));
	}
	initData(){//one time init
		let gl=this.gl,count=this.glData.circleCount;
		let shaderProgram=this.shaderProgram;
		
		//data
		//this.glData.baseColor=;//base color of the circles
		gl.uniform4fv(this.glValue.u_baseColor,this.glData.baseColor);
		gl.uniform1f(this.glValue.u_circleCount,this.glData.circleCount);

		// this.glData.circleSize=new Float32Array(count);//size for each circle
		/*for(let i=count,each=(1-.2)/i;i--;)
			this.glData.circleSize[i]=1-(count-i)*each;//1~0.2*/
		this.glData.circleIndex=new Float32Array(count);//circle index
		for(let i=count;i--;){//generate index
			this.glData.circleIndex[i]=i;
		}

		//set scene matrix
		gl.uniformMatrix4fv(this.glValue.u_sceneMatrix,false,this.glData.sceneMatrix.array);
		gl.uniformMatrix4fv(this.glValue.u_rotateMatrix,false,this.glData.rotateMatrix.array);
		this.canvas.addEventListener('mousemove',e=>{//follow mouse
			let Ry=(this.canvas.width/2-e.offsetX)/this.canvas.width,
				Rx=(this.canvas.height/2-e.offsetY)/this.canvas.height;
			Mat.rotate3d(Mat.Matrixes.I4,Rx,Ry,0,this.glData.rotateMatrix);
			gl.uniformMatrix4fv(this.glValue.u_rotateMatrix,false,this.glData.rotateMatrix.array);
			
		})

		//circle vao
		this.VAO(this.vao.circle=gl.createVertexArray(),()=>{
			//vertex
			gl.enableVertexAttribArray(this.glValue.a_circleVertex);
			gl.bindBuffer(gl.ARRAY_BUFFER,this.glBuffer.circleVertexBuffer);
			gl.vertexAttribPointer(this.glValue.a_circleVertex,2,gl.FLOAT,false,0,0);

			//circle index data
			gl.enableVertexAttribArray(this.glValue.a_circleIndex);
			gl.bindBuffer(gl.ARRAY_BUFFER,this.glBuffer.circleIndexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER,this.glData.circleIndex,gl.STATIC_DRAW);
			gl.vertexAttribPointer(this.glValue.a_circleIndex,1,gl.FLOAT,false,0,0);
			gl.vertexAttribDivisor(this.glValue.a_circleIndex,1);

			//light buffer
			/*for(let i=0;i<this.audioData.frequencyArray.length;i++){
				this.audioData.frequencyArray[i]=Math.random();
			}*/
			gl.enableVertexAttribArray(this.glValue.a_light);
			gl.bindBuffer(gl.ARRAY_BUFFER,this.glBuffer.circleLightBuffer);
			// gl.bufferData(gl.ARRAY_BUFFER,this.audioData.frequencyArray,gl.STREAM_DRAW);
			gl.vertexAttribPointer(this.glValue.a_light,1,gl.FLOAT,false,0,0);
			gl.vertexAttribDivisor(this.glValue.a_light,1);
		});
		
	}
	draw(){
		let gl=this.gl;
		this.refreshAudioData();//get new fre data

		//GL
		gl.clear(gl.COLOR_BUFFER_BIT);
		
		this.VAO(this.vao.circle,()=>{
			//realtime data
			//frequency energy => light
		gl.bindBuffer(gl.ARRAY_BUFFER,this.glBuffer.circleLightBuffer);
		gl.bufferData(gl.ARRAY_BUFFER,this.audioData.frequencyArray,gl.STREAM_DRAW);
			// gl.vertexAttribPointer(this.glValue.a_light,1,gl.FLOAT,false,0,0);

			gl.drawArraysInstanced(gl.TRIANGLE_FAN,0,this.glData.circleVertex.length/2,this.glData.circleCount);
		});
	}
	VAO(vao,func){
		this.gl.bindVertexArray(vao);
		func();
		this.gl.bindVertexArray(null);
	}
	static freValueScale(raw){
		const min=-150.0,max=-20.0;
		raw=(raw-max)/(min-max);
		if(raw>1.0)raw=1.0;
		else if(raw<0.0)raw=0.0;
		return Math.pow((1.0-raw),2.9);
	}
}
function Perspective(fovy,aspect,znear,zfar){
	let m=new Mat(4,4,0),
		_a=1/Math.tan(fovy*Math.PI/180/2),
		arr=m.array;
		arr.fill(0);
		arr[0]=_a/aspect;
		arr[5]=_a;
		arr[10]=zfar/(zfar-znear);
		arr[11]=1
		arr[14]=(zfar*znear)/(znear-zfar);
		console.log(m.toString())
		return m;
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

/*
Copyright 2019 luojia@luojia.me
*/
class GLRoom{
	constructor(canvas){
		this.programs={};
		this.buffers={};
		this.vao={};
		this.canvas=canvas;
		let gl=this.gl=canvas.getContext('webgl2');
		if(!gl){
			alert('Your broswer dosn\'t support WebGL2');
			throw('webgl2 not supported');
		}
	}
	a(programName,attribute){
		return this.programs[programName].a[attribute];
	}
	u(programName,uniform){
		return this.programs[programName].u[uniform];
	}
	_switch(func,...name){
		let r=0;
		for(let s of name){
			r|=this.gl[s];
		}
		this.gl[func](r);
		return this;
	}
	clearColor(r,g,b,a=1){
		this.gl.clearColor(r,g,b,a);
		return this;
	}
	createBuffer(name){
		if(typeof name==='string')
			name=[name];
		for(let n of name){
			if(n in this.buffers)
				throw(new Error('Buffer exists: '+n));
			this.buffers[n]=this.gl.createBuffer();
		}
		return this;
	}
	buffer(name, target=this.gl.ARRAY_BUFFER, dataArray, usage=this.gl.STATIC_DRAW){
		if(name in this.buffers == false)
			this.createBuffer(name);
		this.gl.bindBuffer(target,this.buffers[name]);
		if(arguments.length>2){
			this.gl.bufferData(target,dataArray,usage);
		}
		return this.buffers[name];
	}
	createProgram(name,shaders,use=true){
		//define program
		if(typeof shaders !== 'object'){
			throw(new Error('shaders required'));
		}
		let gl=this.gl;
		if(this.programs[name])
			throw(new Error('program ['+name+'] exists'));

		let GLRoom_Program_p=this.programs[name] = new GLRoom_Program(this,gl.createProgram());
		for(let s_name in shaders){
			let s=shaders[s_name];
			this.shader(GLRoom_Program_p.program,s_name,s[0],s[1]);
		}
		gl.linkProgram(GLRoom_Program_p.program);
		if (!gl.getProgramParameter(GLRoom_Program_p.program, gl.LINK_STATUS)) {
			let info = gl.getProgramInfoLog(GLRoom_Program_p.program);
			console.error("Unable to initialize the shader program:\n",info);
			throw('Error in shader program');
		}
		if(use){
			GLRoom_Program_p.use();
		}
		return GLRoom_Program_p;
	}
	program(name,func){
		if(this.programs[name]){
			this.programs[name].use(func);
			return this.programs[name];
		}else{
			throw('Program "'+name+'" not defined');
		}
	}
	shader(GL_program,name,type,code){
		let gl=this.gl,
			s=gl.createShader(type);
		gl.shaderSource(s,code.trim());
		console.debug('complie shader:',name);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s,gl.COMPILE_STATUS))
			throw("An error occurred compiling the shaders: " + gl.getShaderInfoLog(s));
		gl.attachShader(GL_program,s);
		return s;
	}
	VAO(name,func){
		let vao=this.vao[name];
		if(!vao)
			vao=this.vao[name]=this.gl.createVertexArray();
		this.gl.bindVertexArray(vao);
		func(vao);
		this.gl.bindVertexArray(null);
		return this;
	}
	resizeCanvas(W=this.canvas.offsetWidth,H=this.canvas.offsetHeight){
		[this.canvas.width,this.canvas.height]=[W,H];
	}
}

class GLRoom_Program{
	constructor(glRoom,program){
		this.glRoom=glRoom;
		this.program=program;
		this.u={};//name=>index
		this.a={};//name=>index
	}
	use(func){
		this.glRoom.gl.useProgram(this.program);
		if(typeof func==='function'){
			func(this);
		}
	}
	cacheUniformLocation(list){
		for(let u of list)
			this.u[u]=this.glRoom.gl.getUniformLocation(this.program,u);
		return this;
	}
	cacheAttributeLocation(list){
		for(let a of list)
			this.a[a]=this.glRoom.gl.getAttribLocation(this.program,a);
		return this;
	}
}
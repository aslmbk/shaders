const vsSource = /* glsl */ `
attribute vec4 aPosition;
attribute float aPointSize;
void main() {
  gl_Position = aPosition;
  gl_PointSize = aPointSize;
}`;

const fsSource = /* glsl */ `
void main() {
  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}`;

const canvas = document.getElementById("webgl");
canvas.addEventListener(
  "webglcontextcreationerror",
  (event) => console.log(event.statusMessage),
  false
);

const gl = canvas.getContext("webgl");

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.clearDepth(1.0);
gl.clear(gl.DEPTH_BUFFER_BIT);

gl.clearStencil(0);
gl.clear(gl.STENCIL_BUFFER_BIT);

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vsSource);
gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
  console.log("Failed to compile shader: " + gl.getShaderInfoLog(shader));
  gl.deleteShader(vertexShader);
}

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fsSource);
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
  console.log(`Failed to compile shader: ${gl.getShaderInfoLog(shader)}`);
  gl.deleteShader(fragmentShader);
}

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.log(`Failed to link program: ${gl.getProgramInfoLog(program)}`);
  gl.deleteProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
}
gl.useProgram(program);

const aPosition = gl.getAttribLocation(program, "aPosition");
if (aPosition < 0) {
  console.log("Failed to get attribute location");
}
gl.vertexAttrib3f(aPosition, 0.0, 0.0, 0.0);

const aPointSize = gl.getAttribLocation(program, "aPointSize");
if (aPointSize < 0) {
  console.log("Failed to get attribute location");
}
gl.vertexAttrib1f(aPointSize, 20.0);

gl.drawArrays(gl.POINTS, 0, 1); // gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, gl.TRIANGLES, gl.TRIANGLE_STRIP, gl.TRIANGLE_FAN

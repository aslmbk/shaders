const vsSource = /* glsl */ `
attribute vec4 aPosition;
uniform vec4 uTranslate;
uniform float uAngle;
void main() {
  float cosB = cos(uAngle);
  float sinB = sin(uAngle);
  vec4 pos = aPosition;
  pos.x = aPosition.x * cosB - aPosition.y * sinB;
  pos.y = aPosition.x * sinB + aPosition.y * cosB;
  gl_Position = pos + uTranslate;
}`;

const fsSource = /* glsl */ `
precision mediump float;
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

const angle = -Math.PI / 2;

const aPosition = gl.getAttribLocation(program, "aPosition");
const uTranslate = gl.getUniformLocation(program, "uTranslate");
const uAngle = gl.getUniformLocation(program, "uAngle");

gl.uniform4f(uTranslate, 0.5, 0.5, 0.0, 0.0);
gl.uniform1f(uAngle, angle);

const vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
const n = 3;
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosition);

gl.drawArrays(gl.TRIANGLES, 0, n);

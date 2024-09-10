const vsSource = `
uniform mat4 uRotateMatrix;
uniform mat4 uTranslateMatrix;
uniform mat4 uScaleMatrix;

attribute vec4 aPosition;

void main() {
  gl_Position = uTranslateMatrix * uRotateMatrix * uScaleMatrix * aPosition;
}`;

const fsSource = `
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

const uRotateMatrix = gl.getUniformLocation(program, "uRotateMatrix");
const angle = 90;
const radian = (angle * Math.PI) / 180;
const cosB = Math.cos(radian);
const sinB = Math.sin(radian);
const rotateMatrix = new Float32Array([
  cosB,
  sinB,
  0.0,
  0.0,
  -sinB,
  cosB,
  0.0,
  0.0,
  0.0,
  0.0,
  1.0,
  0.0,
  0.0,
  0.0,
  0.0,
  1.0,
]);
gl.uniformMatrix4fv(uRotateMatrix, false, rotateMatrix);

const uTranslateMatrix = gl.getUniformLocation(program, "uTranslateMatrix");
const translateX = 0.5;
const translateY = 0.5;
const translateZ = 0.0;
const translateMatrix = new Float32Array([
  1.0,
  0.0,
  0.0,
  0.0,
  0.0,
  1.0,
  0.0,
  0.0,
  0.0,
  0.0,
  1.0,
  0.0,
  translateX,
  translateY,
  translateZ,
  1.0,
]);
gl.uniformMatrix4fv(uTranslateMatrix, false, translateMatrix);

const uScaleMatrix = gl.getUniformLocation(program, "uScaleMatrix");
const scaleX = 0.5;
const scaleY = 1.5;
const scaleZ = 1.0;
const scaleMatrix = new Float32Array([
  scaleX,
  0.0,
  0.0,
  0.0,
  0.0,
  scaleY,
  0.0,
  0.0,
  0.0,
  0.0,
  scaleZ,
  0.0,
  0.0,
  0.0,
  0.0,
  1.0,
]);
gl.uniformMatrix4fv(uScaleMatrix, false, scaleMatrix);

const aPosition = gl.getAttribLocation(program, "aPosition");

const vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
const n = 3;
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosition);

gl.drawArrays(gl.TRIANGLES, 0, n);

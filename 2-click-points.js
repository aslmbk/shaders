const vsSource = `
attribute vec4 aPosition;
attribute float aPointSize;
varying vec4 vColor;
void main() {
  vColor = aPosition;
  gl_Position = aPosition;
  gl_PointSize = aPointSize;
}`;

const fsSource = `
precision mediump float;
varying vec4 vColor;
void main() {
  gl_FragColor = vec4(vColor.xy, 1.0, 1.0);
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
const aPointSize = gl.getAttribLocation(program, "aPointSize");

const points = [];

canvas.addEventListener("click", (event) => {
  const x = event.clientX;
  const y = event.clientY;
  const rect = event.target.getBoundingClientRect();
  const u = (x - rect.left - canvas.width / 2) / (canvas.width / 2);
  const v = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
  points.push({
    x: u,
    y: v,
    size: Math.max(Math.random(), 0.3) * 20.0,
  });

  gl.clear(gl.COLOR_BUFFER_BIT);

  for (let i = 0; i < points.length; i++) {
    gl.vertexAttrib3f(aPosition, points[i].x, points[i].y, 0.0);
    gl.vertexAttrib1f(aPointSize, points[i].size);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
});

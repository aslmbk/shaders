const vertexShader = /* glsl */ `
attribute vec4 aPosition;
attribute float aPointSize;
attribute vec4 aColor;
varying vec4 vColor;
void main() {
  gl_Position = aPosition;
  gl_PointSize = aPointSize;
  vColor = aColor;
}`;

const fragmentShader = /* glsl */ `
precision mediump float;
varying vec4 vColor;
void main() {
  gl_FragColor = vColor;
}`;

const { gl, program } = createWebGLProgram({
  vertexShader,
  fragmentShader,
});

const clearColor = [0.0, 0.0, 0.0, 1.0];
gl.clearColor(...clearColor);

const aPosition = gl.getAttribLocation(program, "aPosition");
const aPointSize = gl.getAttribLocation(program, "aPointSize");
const aColor = gl.getAttribLocation(program, "aColor");

const n = 3;
const vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
const pointSizes = new Float32Array([10.0, 20.0, 30.0]);
const colors = new Float32Array([1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0]);
const combinedData = new Float32Array([
  0.0, 0.5, 10.0, 1.0, 0.0, 0.0, -0.5, -0.5, 20.0, 1.0, 0.0, 1.0, 0.5, -0.5,
  30.0, 0.0, 0.0, 1.0,
]);
const FSIZE = vertices.BYTES_PER_ELEMENT;

// We can create two buffers and bind them separately
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPosition);

const pointSizeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pointSizeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, pointSizes, gl.STATIC_DRAW);
gl.vertexAttribPointer(aPointSize, 1, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aPointSize);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(aColor);

// Or we can join the two buffers into one
// const combinedBuffer = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, combinedBuffer);
// gl.bufferData(gl.ARRAY_BUFFER, combinedData, gl.STATIC_DRAW);
// gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, FSIZE * 6, 0);
// gl.enableVertexAttribArray(aPosition);
// gl.vertexAttribPointer(aPointSize, 1, gl.FLOAT, false, FSIZE * 6, FSIZE * 2);
// gl.enableVertexAttribArray(aPointSize);
// gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
// gl.enableVertexAttribArray(aColor);

gl.bindBuffer(gl.ARRAY_BUFFER, null);

const draw = ({ n, primitive, newClearColor }) => {
  if (newClearColor) {
    gl.clearColor(...newClearColor);
  }
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(primitive, 0, n);
};

draw({ n, primitive: gl.POINTS });

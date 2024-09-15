const vertexShader = `
attribute vec4 aPosition;
void main() {
  gl_Position = aPosition;
}`;

const fragmentShader = `
precision mediump float;
uniform float uWidth;
uniform float uHeight;
varying vec4 vColor;
void main() {
  gl_FragColor = vec4(
    gl_FragCoord.x / uWidth,
    gl_FragCoord.y / uHeight,
    1.0,
    1.0
  );
}`;

const { gl, program } = createWebGLProgram({
  vertexShader,
  fragmentShader,
});

const clearColor = [0.0, 0.0, 0.0, 1.0];
gl.clearColor(...clearColor);

const aPosition = gl.getAttribLocation(program, "aPosition");

const n = 3;
const vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
bindBuffer({
  gl,
  data: vertices,
  attribute: aPosition,
  size: 2,
});

const uWidth = gl.getUniformLocation(program, "uWidth");
const uHeight = gl.getUniformLocation(program, "uHeight");

gl.uniform1f(uWidth, gl.drawingBufferWidth);
gl.uniform1f(uHeight, gl.drawingBufferHeight);

const draw = ({ verticesCount, primitive, newClearColor }) => {
  if (newClearColor) {
    gl.clearColor(...newClearColor);
  }
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(primitive, 0, verticesCount);
};

draw({
  verticesCount: n,
  primitive: gl.TRIANGLES,
});

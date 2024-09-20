const vertexShader = `
attribute vec4 aPosition;
attribute vec4 aColor;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uModelViewMatrix;
varying vec4 vColor;
void main() {
  gl_Position = uModelViewMatrix * aPosition;
  // gl_Position = uViewMatrix * uModelMatrix * aPosition;
  vColor = aColor;
}`;

const fragmentShader = `
#ifdef GL_ES
precision mediump float;
#endif
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
const aColor = gl.getAttribLocation(program, "aColor");

const n = 9;
// prettier-ignore
const vertices = new Float32Array([
    0.0, 0.5, -0.4, 0.4, 1.0, 0.4, // The back green one
    -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
    0.5, -0.5, -0.4, 1.0, 0.4, 0.4, 
   
    0.5, 0.4, -0.2, 1.0, 0.4, 0.4, // The middle yellow one
    -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
    0.0, -0.6, -0.2, 1.0, 1.0, 0.4, 

    0.0, 0.5, 0.0, 0.4, 0.4, 1.0,  // The front blue one 
    -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
    0.5, -0.5, 0.0, 1.0, 0.4, 0.4, 
]);

bindBuffers({
  gl,
  data: vertices,
  attributesData: [
    {
      attribute: aPosition,
      size: 3,
      stride: 6,
      offset: 0,
    },
    {
      attribute: aColor,
      size: 3,
      stride: 6,
      offset: 3,
    },
  ],
});

const uViewMatrix = gl.getUniformLocation(program, "uViewMatrix");
const viewMatrix = new Matrix4();
// prettier-ignore
viewMatrix.setLookAt(
  // eye position
  0.2, 0.25, 0.25,
  // look-at position
  0, 0, 0,
  // up direction
  0, 1, 0
);
gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix.elements);

const uModelMatrix = gl.getUniformLocation(program, "uModelMatrix");
const modelMatrix = new Matrix4();
modelMatrix.setRotate(-10, 0, 0, 1);
gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix.elements);

const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
const modelViewMatrix = new Matrix4();
modelViewMatrix.set(viewMatrix).multiply(modelMatrix);
gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix.elements);

const draw = ({ verticesCount, primitive, newClearColor }) => {
  if (newClearColor) {
    gl.clearColor(...newClearColor);
  }
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(primitive, 0, verticesCount);
  requestAnimationFrame(() =>
    draw({ verticesCount, primitive, newClearColor })
  );
};

draw({
  verticesCount: n,
  primitive: gl.TRIANGLES,
});

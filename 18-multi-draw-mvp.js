const vertexShader = `
attribute vec4 aPosition;
attribute vec4 aColor;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec4 vColor;
void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
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
    // Vertex coordinates and color
     0.0,  1.0,  -4.0,  0.4,  1.0,  0.4, // The back green one
    -0.5, -1.0,  -4.0,  0.4,  1.0,  0.4,
     0.5, -1.0,  -4.0,  1.0,  0.4,  0.4, 

     0.0,  1.0,  -2.0,  1.0,  1.0,  0.4, // The middle yellow one
    -0.5, -1.0,  -2.0,  1.0,  1.0,  0.4,
     0.5, -1.0,  -2.0,  1.0,  0.4,  0.4, 

     0.0,  1.0,   0.0,  0.4,  0.4,  1.0,  // The front blue one 
    -0.5, -1.0,   0.0,  0.4,  0.4,  1.0,
     0.5, -1.0,   0.0,  1.0,  0.4,  0.4, 
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

const viewMatrix = new Matrix4();
// prettier-ignore
viewMatrix.setLookAt(
  // eye position
  0, 0, 5,
  // look-at position
  0, 0, 0,
  // up direction
  0, 1, 0
);
const modelMatrix = new Matrix4();
modelMatrix.setRotate(0, 0, 0, 1);
const modelViewMatrix = new Matrix4();
modelViewMatrix.set(viewMatrix).multiply(modelMatrix);

const projectionMatrix = new Matrix4();
projectionMatrix.setPerspective(30, gl.canvas.width / gl.canvas.height, 1, 100);

const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix.elements);
gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix.elements);

const draw = ({ verticesCount, primitive, newClearColor }) => {
  if (newClearColor) {
    gl.clearColor(...newClearColor);
  }

  gl.clear(gl.COLOR_BUFFER_BIT);

  modelMatrix.setTranslate(0.75, 0, 0);
  modelViewMatrix.set(viewMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix.elements);

  gl.drawArrays(primitive, 0, verticesCount);

  modelMatrix.setTranslate(-0.75, 0, 0);
  modelViewMatrix.set(viewMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix.elements);

  gl.drawArrays(primitive, 0, verticesCount);
  requestAnimationFrame(() =>
    draw({ verticesCount, primitive, newClearColor })
  );
};

draw({
  verticesCount: n,
  primitive: gl.TRIANGLES,
});

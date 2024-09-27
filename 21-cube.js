const vertexShader = /* glsl */ `
attribute vec4 aPosition;
attribute vec4 aColor;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
varying vec4 vColor;
void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
  vColor = aColor;
}`;

const fragmentShader = /* glsl */ `
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
  enableDdepthBuffer: true,
  enablePoligonOffset: true,
});

const clearColor = [0.0, 0.0, 0.0, 1.0];
gl.clearColor(...clearColor);

const aPosition = gl.getAttribLocation(program, "aPosition");
const aColor = gl.getAttribLocation(program, "aColor");

// Create a cube
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |     | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3
// prettier-ignore
const vertices = new Float32Array([
    // Vertex coordinates and color
     1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
    -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
    -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
     1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
     1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
     1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
    -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
    -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
]);

// prettier-ignore
const indices = new Uint8Array([
    // Indices of the vertices
    0, 1, 2,   0, 2, 3,    // front
    0, 3, 4,   0, 4, 5,    // right
    0, 5, 6,   0, 6, 1,    // up
    1, 6, 7,   1, 7, 2,    // left
    7, 4, 3,   7, 3, 2,    // down
    4, 7, 6,   4, 6, 5     // back
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
  indices,
});

const viewMatrix = new Matrix4();
// prettier-ignore
viewMatrix.setLookAt(
  // eye position
  3, 3, 7,
  // look-at position
  0, 0, 0,
  // up direction
  0, 1, 0
);
const modelMatrix = new Matrix4();
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

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(primitive, verticesCount, gl.UNSIGNED_BYTE, 0);
  requestAnimationFrame(() =>
    draw({ verticesCount, primitive, newClearColor })
  );
};

draw({
  verticesCount: indices.length,
  primitive: gl.TRIANGLES,
});

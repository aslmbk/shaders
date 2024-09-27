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

const n = 6;
// prettier-ignore
const vertices = new Float32Array([
    // Vertex coordinates and color
     0.0,  2.5,  -5.0,  0.4,  1.0,  0.4, // The green triangle
    -2.5, -2.5,  -5.0,  0.4,  1.0,  0.4,
     2.5, -2.5,  -5.0,  1.0,  0.4,  0.4, 

     0.0,  3.0,  -5.0,  1.0,  0.4,  0.4, // The yellow triagle
    -3.0, -3.0,  -5.0,  1.0,  1.0,  0.4,
     3.0, -3.0,  -5.0,  1.0,  1.0,  0.4, 
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
  3.06, 2.5, 10.0,
  // look-at position
  0, 0, -2,
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

  gl.disable(gl.POLYGON_OFFSET_FILL);
  gl.drawArrays(primitive, 0, verticesCount / 2);
  gl.enable(gl.POLYGON_OFFSET_FILL);
  gl.polygonOffset(1.0, 1.0);
  gl.drawArrays(primitive, verticesCount / 2, verticesCount / 2);
  requestAnimationFrame(() =>
    draw({ verticesCount, primitive, newClearColor })
  );
};

draw({
  verticesCount: n,
  primitive: gl.TRIANGLES,
});

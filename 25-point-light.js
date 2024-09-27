const vertexShader = /* glsl */ `
attribute vec4 aPosition;
attribute vec4 aColor;
attribute vec4 aNormal;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uMVPMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform vec3 uAmbientLight;
varying vec4 vColor;
void main() {
    gl_Position = uMVPMatrix * aPosition;
    vec3 normal = normalize(vec3(uNormalMatrix * aNormal));
    // calculate world position
    vec4 worldPosition = uModelMatrix * aPosition;
    // calculate the light direction and make it point to the light source
    vec3 lightDirection = normalize(uLightPosition - vec3(worldPosition));
    // calculate the dot product of the light direction and the normal
    float nDotL = max(dot(lightDirection, normal), 0.0);
    // calculate the color due to diffuse reflection
    vec3 diffuse = uLightColor * vec3(aColor) * nDotL;
    // calculate the color due to ambient reflection
    vec3 ambient = uAmbientLight * vec3(aColor);
    vColor = vec4(diffuse + ambient, aColor.a);
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
const aNormal = gl.getAttribLocation(program, "aNormal");

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
    // Vertex coordinates
    1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
    1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
   -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
   -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
    1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
]);

// prettier-ignore
const colors = new Float32Array([
  // Colors
  1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v1-v2-v3 front
  1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v3-v4-v5 right
  1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v0-v5-v6-v1 up
  1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v6-v7-v2 left
  1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v7-v4-v3-v2 down
  1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,    // v4-v7-v6-v5 back
]);

// prettier-ignore
const normals = new Float32Array([
  // Normal
  0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
  1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
  0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
 -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
  0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
  0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
]);

// prettier-ignore
const indices = new Uint8Array([
    // Indices of the vertices
    0, 1, 2,   0, 2, 3,    // front
    4, 5, 6,   4, 6, 7,    // right
    8, 9,10,   8,10,11,    // up
   12,13,14,  12,14,15,    // left
   16,17,18,  16,18,19,    // down
   20,21,22,  20,22,23     // back
]);

bindBuffer({
  gl,
  data: vertices,
  attribute: aPosition,
  size: 3,
  indices,
});

bindBuffer({
  gl,
  data: colors,
  attribute: aColor,
  size: 3,
});

bindBuffer({
  gl,
  data: normals,
  attribute: aNormal,
  size: 3,
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
const projectionMatrix = new Matrix4();
projectionMatrix.setPerspective(30, gl.canvas.width / gl.canvas.height, 1, 100);

const modelViewMatrix = new Matrix4();
modelViewMatrix.set(viewMatrix).multiply(modelMatrix);

const mvpMatrix = new Matrix4();
mvpMatrix.set(projectionMatrix).multiply(modelViewMatrix);

const normalMatrix = new Matrix4();
normalMatrix.setInverseOf(modelMatrix);
normalMatrix.transpose();

const lightPosition = new Vector3([2.3, 4.0, 3.5].map((v) => v * 0.4));
const lightColor = new Vector3([1.0, 1.0, 1.0]);
const ambientLight = new Vector3([1, 1, 1].map((v) => v * 0.1));

const uViewMatrix = gl.getUniformLocation(program, "uViewMatrix");
const uModelMatrix = gl.getUniformLocation(program, "uModelMatrix");
const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
const uMVPMatrix = gl.getUniformLocation(program, "uMVPMatrix");
const uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
const uLightPosition = gl.getUniformLocation(program, "uLightPosition");
const uLightColor = gl.getUniformLocation(program, "uLightColor");
const uAmbientLight = gl.getUniformLocation(program, "uAmbientLight");
gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix.elements);
gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix.elements);
gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix.elements);
gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix.elements);
gl.uniformMatrix4fv(uMVPMatrix, false, mvpMatrix.elements);
gl.uniformMatrix4fv(uNormalMatrix, false, normalMatrix.elements);
gl.uniform3fv(uLightPosition, lightPosition.elements);
gl.uniform3fv(uLightColor, lightColor.elements);
gl.uniform3fv(uAmbientLight, ambientLight.elements);

const draw = ({ verticesCount, primitive, newClearColor }) => {
  if (newClearColor) {
    gl.clearColor(...newClearColor);
  }

  modelMatrix.rotate(0.3, 0, 1, 0);
  gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix.elements);
  modelViewMatrix.set(viewMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix.elements);
  mvpMatrix.set(projectionMatrix).multiply(modelViewMatrix);
  gl.uniformMatrix4fv(uMVPMatrix, false, mvpMatrix.elements);

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(uNormalMatrix, false, normalMatrix.elements);

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

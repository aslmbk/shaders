const vertexShader = /* glsl */ `
attribute vec4 aPosition;
attribute vec4 aNormal;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uAmbientLight;
uniform vec3 uColor;
varying vec4 vColor;
varying float vDist;
void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
    vec3 normal = normalize(vec3(uNormalMatrix * aNormal));
    float nDotL = max(dot(uLightDirection, normal), 0.0);
    vec3 diffuse = uLightColor * uColor * nDotL;
    vec3 ambient = uAmbientLight * uColor;
    vColor = vec4(diffuse + ambient, 1.0);
    vDist = gl_Position.w;
}`;

const fragmentShader = /* glsl */ `
#ifdef GL_ES
precision mediump float;
#endif
uniform vec3 uFogColor;
uniform vec2 uFogDist;
varying vec4 vColor;
varying float vDist;
void main() {
    // Calculation of fog factor (factor becomes smaller as it goes further away from eye point)
    float factor = clamp((uFogDist.y - vDist) / (uFogDist.y - uFogDist.x), 0.0, 1.0);
    // Stronger fog as it gets further: uFogColor * (1 - factor) + vColor * factor
    vec3 color = mix(uFogColor, vec3(vColor), factor);
    gl_FragColor = vec4(color, vColor.a);
}`;

const { gl, program } = createWebGLProgram({
  vertexShader,
  fragmentShader,
  enableDepthBuffer: true,
  enablePoligonOffset: true,
  preserveDrawingBuffer: true,
});

const clearColor = [0.0, 0.0, 0.0, 1.0];
gl.clearColor(...clearColor);

const aPosition = gl.getAttribLocation(program, "aPosition");
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
  data: normals,
  attribute: aNormal,
  size: 3,
});

let eyePositionZ = 7.0;
const color = new Vector3([1.0, 1.0, 1.0]);
const fogColor = new Float32Array([0.137, 0.231, 0.423]);
// Distance of fog [where fog starts, where fog completely covers object]
const fogDist = new Float32Array([10, 15]);

const lightDirection = new Vector3([0.5, 3.0, 4.0]);
lightDirection.normalize();
const lightColor = new Vector3([1.0, 1.0, 1.0]);
const ambientLight = new Vector3([0.2, 0.2, 0.2]);

const viewMatrix = new Matrix4();
// prettier-ignore
viewMatrix.setLookAt(
  // eye position
  3.0, 3.0, eyePositionZ,
  // look-at position
  0, 0, 0,
  // up direction
  0, 1, 0
);
const modelMatrix = new Matrix4();
const projectionMatrix = new Matrix4();
projectionMatrix.setPerspective(30, gl.canvas.width / gl.canvas.height, 1, 100);

const normalMatrix = new Matrix4();
normalMatrix.setInverseOf(modelMatrix);
normalMatrix.transpose();

const uFogColor = gl.getUniformLocation(program, "uFogColor");
const uFogDist = gl.getUniformLocation(program, "uFogDist");
const uColor = gl.getUniformLocation(program, "uColor");
const uModelMatrix = gl.getUniformLocation(program, "uModelMatrix");
const uViewMatrix = gl.getUniformLocation(program, "uViewMatrix");
const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
const uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
const uLightDirection = gl.getUniformLocation(program, "uLightDirection");
const uLightColor = gl.getUniformLocation(program, "uLightColor");
const uAmbientLight = gl.getUniformLocation(program, "uAmbientLight");
gl.uniform3fv(uFogColor, fogColor);
gl.uniform2fv(uFogDist, fogDist);
gl.uniform3fv(uColor, color.elements);
gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix.elements);
gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix.elements);
gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix.elements);
gl.uniformMatrix4fv(uNormalMatrix, false, normalMatrix.elements);
gl.uniform3fv(uLightDirection, lightDirection.elements);
gl.uniform3fv(uLightColor, lightColor.elements);
gl.uniform3fv(uAmbientLight, ambientLight.elements);

document.onkeydown = (e) => {
  switch (e.key) {
    case "ArrowUp":
      eyePositionZ += 0.2;
      break;
    case "ArrowDown":
      eyePositionZ -= 0.2;
      break;
  }
};

gl.clearColor(...fogColor, 1.0);

const draw = () => {
  viewMatrix.setLookAt(3.0, 3.0, eyePositionZ, 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_BYTE, 0);
  requestAnimationFrame(draw);
};

draw();

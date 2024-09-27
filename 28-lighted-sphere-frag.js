const vertexShader = /* glsl */ `
attribute vec4 aPosition;
attribute vec4 aNormal;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
varying vec4 vColor;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
    vec4 color = vec4(1.0);
    vec3 normal = normalize(vec3(uNormalMatrix * aNormal));
    vPosition = vec3(uModelMatrix * aPosition);
    vNormal = normalize(vec3(uNormalMatrix * aNormal));
    vColor = color;
}`;

const fragmentShader = /* glsl */ `
#ifdef GL_ES
precision mediump float;
#endif
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform vec3 uAmbientLight;
varying vec4 vColor;
varying vec3 vNormal;
varying vec3 vPosition;
void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDirection = normalize(uLightPosition - vPosition);
    float nDotL = max(dot(lightDirection, normal), 0.0);
    vec3 diffuse = uLightColor * vec3(vColor) * nDotL;
    vec3 ambient = uAmbientLight * vec3(vColor);
    gl_FragColor = vec4(diffuse + ambient, vColor.a);
}`;

const { gl, program } = createWebGLProgram({
  vertexShader,
  fragmentShader,
  enableDepthBuffer: true,
  enablePoligonOffset: true,
});

const clearColor = [0.0, 0.0, 0.0, 1.0];
gl.clearColor(...clearColor);

const aPosition = gl.getAttribLocation(program, "aPosition");
const aNormal = gl.getAttribLocation(program, "aNormal");

// Create a sphere
const SPHERE_DIV = 13;
let i, ai, si, ci;
let j, aj, sj, cj;
let p1, p2;
const positions = [];
const indices = [];

// Generate coordinates
for (j = 0; j <= SPHERE_DIV; j++) {
  aj = (j * Math.PI) / SPHERE_DIV;
  sj = Math.sin(aj);
  cj = Math.cos(aj);
  for (i = 0; i <= SPHERE_DIV; i++) {
    ai = (i * 2 * Math.PI) / SPHERE_DIV;
    si = Math.sin(ai);
    ci = Math.cos(ai);

    positions.push(si * sj); // X
    positions.push(cj); // Y
    positions.push(ci * sj); // Z
  }
}

// Generate indices
for (j = 0; j < SPHERE_DIV; j++) {
  for (i = 0; i < SPHERE_DIV; i++) {
    p1 = j * (SPHERE_DIV + 1) + i;
    p2 = p1 + (SPHERE_DIV + 1);

    indices.push(p1);
    indices.push(p2);
    indices.push(p1 + 1);

    indices.push(p1 + 1);
    indices.push(p2);
    indices.push(p2 + 1);
  }
}

bindBuffer({
  gl,
  data: new Float32Array(positions),
  attribute: aPosition,
  size: 3,
  indices: new Uint16Array(indices),
});

bindBuffer({
  gl,
  data: new Float32Array(positions),
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

const normalMatrix = new Matrix4();
normalMatrix.setInverseOf(modelMatrix);
normalMatrix.transpose();

const lightPosition = new Vector3([2.3, 4.0, 3.5].map((v) => v * 2));
const lightColor = new Vector3([1.0, 1.0, 1.0].map((v) => v * 0.7));
const ambientLight = new Vector3([1, 1, 1].map((v) => v * 0.1));

const uViewMatrix = gl.getUniformLocation(program, "uViewMatrix");
const uModelMatrix = gl.getUniformLocation(program, "uModelMatrix");
const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
const uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");
const uLightPosition = gl.getUniformLocation(program, "uLightPosition");
const uLightColor = gl.getUniformLocation(program, "uLightColor");
const uAmbientLight = gl.getUniformLocation(program, "uAmbientLight");
gl.uniformMatrix4fv(uViewMatrix, false, viewMatrix.elements);
gl.uniformMatrix4fv(uModelMatrix, false, modelMatrix.elements);
gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix.elements);
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

  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  gl.uniformMatrix4fv(uNormalMatrix, false, normalMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawElements(primitive, verticesCount, gl.UNSIGNED_SHORT, 0);
  requestAnimationFrame(() =>
    draw({ verticesCount, primitive, newClearColor })
  );
};

draw({
  verticesCount: indices.length,
  primitive: gl.TRIANGLES,
});

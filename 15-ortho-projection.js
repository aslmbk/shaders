const vertexShader = /* glsl */ `
attribute vec4 aPosition;
attribute vec4 aColor;
uniform mat4 uProjectionMatrix;
varying vec4 vColor;
void main() {
  gl_Position = uProjectionMatrix * aPosition;
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

let near = 0.0;
let far = 0.5;

const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
const projectionMatrix = new Matrix4();
projectionMatrix.setOrtho(-1, 1, -1, 1, near, far);
gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix.elements);

const draw = ({ verticesCount, primitive, newClearColor }) => {
  if (newClearColor) {
    gl.clearColor(...newClearColor);
  }

  projectionMatrix.setOrtho(-1, 1, -1, 1, near, far);
  gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(primitive, 0, verticesCount);
  requestAnimationFrame(() =>
    draw({ verticesCount, primitive, newClearColor })
  );
};

const nearFarChangeValue = 0.05;

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
      near += nearFarChangeValue;
      break;
    case "ArrowDown":
      near -= nearFarChangeValue;
      break;
    case "ArrowRight":
      far += nearFarChangeValue;
      break;
    case "ArrowLeft":
      far -= nearFarChangeValue;
      break;
  }

  console.log({ near, far });
});

draw({
  verticesCount: n,
  primitive: gl.TRIANGLES,
});

const vertexShader = `
attribute vec4 aPosition;
attribute vec4 aColor;
uniform mat4 uModelViewMatrix;
varying vec4 vColor;
void main() {
  gl_Position = uModelViewMatrix * aPosition;
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

const viewMatrix = new Matrix4();
let eyeX = 0.2;
let eyeY = 0.25;
let eyeZ = 0.25;
// prettier-ignore
viewMatrix.setLookAt(
  // eye position
  eyeX, eyeY, eyeZ,
  // look-at position
  0, 0, 0,
  // up direction
  0, 1, 0
);
const modelMatrix = new Matrix4();
modelMatrix.setRotate(-10, 0, 0, 1);
const modelViewMatrix = new Matrix4();
modelViewMatrix.set(viewMatrix).multiply(modelMatrix);

const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix.elements);

const draw = ({ verticesCount, primitive, newClearColor }) => {
  if (newClearColor) {
    gl.clearColor(...newClearColor);
  }

  modelViewMatrix.set(viewMatrix).multiply(modelMatrix);
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(primitive, 0, verticesCount);
  requestAnimationFrame(() =>
    draw({ verticesCount, primitive, newClearColor })
  );
};

const modelRotationSpeed = 5;
const eyeSpeed = 0.01;

document.onkeydown = (e) => {
  switch (e.key) {
    case "ArrowUp":
      modelMatrix.rotate(modelRotationSpeed, 1, 0, 0);
      break;
    case "ArrowDown":
      modelMatrix.rotate(-modelRotationSpeed, 1, 0, 0);
      break;
    case "ArrowLeft":
      modelMatrix.rotate(modelRotationSpeed, 0, 1, 0);
      break;
    case "ArrowRight":
      modelMatrix.rotate(-modelRotationSpeed, 0, 1, 0);
      break;
    case "w":
    case "W":
      eyeY += eyeSpeed;
      break;
    case "s":
    case "S":
      eyeY -= eyeSpeed;
      break;
    case "a":
    case "A":
      eyeX -= eyeSpeed;
      break;
    case "d":
    case "D":
      eyeX += eyeSpeed;
      break;
  }
  viewMatrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, 0, 0, 1, 0);
};

draw({
  verticesCount: n,
  primitive: gl.TRIANGLES,
});

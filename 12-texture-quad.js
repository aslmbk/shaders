const vertexShader = `
attribute vec4 aPosition;
attribute vec4 aUv;
varying vec4 vUv;
void main() {
  gl_Position = aPosition;
  vUv = aUv;
}`;

const fragmentShader = `
precision mediump float;
uniform sampler2D uTexture;
uniform sampler2D uTexture2;
varying vec4 vUv;
void main() {
  vec4 color = texture2D(uTexture, vUv.xy);
  vec4 color2 = texture2D(uTexture2, vUv.xy);
  gl_FragColor = color * color2;
}`;

const { gl, program } = createWebGLProgram({
  vertexShader,
  fragmentShader,
});

const clearColor = [0.0, 0.0, 0.0, 1.0];
gl.clearColor(...clearColor);

const aPosition = gl.getAttribLocation(program, "aPosition");
const aUv = gl.getAttribLocation(program, "aUv");

const n = 4;
const vertices = new Float32Array([
  -0.5, 0.5, 0.0, 1.0, -0.5, -0.5, 0.0, 0.0, 0.5, 0.5, 1.0, 1.0, 0.5, -0.5, 1.0,
  0.0,
]);
bindBuffers({
  gl,
  data: vertices,
  attributesData: [
    {
      attribute: aPosition,
      size: 2,
      stride: 4,
      offset: 0,
    },
    {
      attribute: aUv,
      size: 2,
      stride: 4,
      offset: 2,
    },
  ],
});

const uTexture = gl.getUniformLocation(program, "uTexture");
const uTexture2 = gl.getUniformLocation(program, "uTexture2");
create2DTexture({
  gl,
  minFilterType: gl.LINEAR,
  textureLocation: uTexture,
  textureLocationIndex: 0,
  imageSrc: "resources/sky.jpg",
});
create2DTexture({
  gl,
  textureCell: gl.TEXTURE1,
  textureLocation: uTexture2,
  textureLocationIndex: 1,
  imageSrc: "resources/circle.gif",
});

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
  primitive: gl.TRIANGLE_STRIP,
});

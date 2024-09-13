let _gl = null;

/**
 * Creates a WebGL shader.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @param {number} type - The type of shader.
 * @param {string} source - The source code of the shader.
 * @returns {WebGLShader} The WebGL shader.
 * @throws {string} The error message.
 */
const createShader = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`Failed to compile shader: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
  }
  return shader;
};

/**
 * Creates a WebGL program.
 * @param {Object} options
 * @param {string} options.elementName - The name of the canvas element.
 * @param {string} options.contextName - The name of the context.
 * @param {string} options.vertexShader - The vertex shader.
 * @param {string} options.fragmentShader - The fragment shader.
 * @returns {Object} The WebGL context and program.
 * @returns {WebGLRenderingContext} Object.gl - The WebGL context.
 * @returns {WebGLProgram} Object.program - The WebGL program.
 * @throws {string} The error message.
 */
const createWebGLProgram = ({
  elementName = "webgl",
  contextName = "webgl",
  vertexShader,
  fragmentShader,
}) => {
  const canvas = document.getElementById(elementName);
  canvas.addEventListener(
    "webglcontextcreationerror",
    (event) => console.log(event.statusMessage),
    false
  );

  const gl = canvas.getContext(contextName);
  _gl = gl;

  // gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // gl.clear(gl.COLOR_BUFFER_BIT);
  // gl.clearDepth(1.0);
  // gl.clear(gl.DEPTH_BUFFER_BIT);
  // gl.clearStencil(0);
  // gl.clear(gl.STENCIL_BUFFER_BIT);

  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(`Failed to link program: ${gl.getProgramInfoLog(program)}`);
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
  }

  gl.useProgram(program);

  return { gl, program };
};

/**
 * Binds a buffer to a WebGL context.
 * @param {Object} options
 * @param {WebGLRenderingContext} options.gl - The WebGL context.
 * @param {WebGLBuffer} options.buffer - The buffer to bind.
 * @param {number} options.bufferType - The type of buffer to bind.
 * @param {TypedArray} options.data - The data to bind.
 * @param {number} options.dataMemoryType - The memory type of the data.
 * @param {number} options.attribute - The attribute to bind.
 * @param {number} options.size - The size of the attribute.
 * @param {number} options.type - The type of the attribute.
 * @param {boolean} options.normalized - Whether the attribute is normalized.
 * @param {number} options.stride - The stride of the attribute.
 * @param {number} options.offset - The offset of the attribute.
 */
const bindBuffer = ({
  gl,
  buffer,
  bufferType,
  data,
  dataMemoryType,
  attribute,
  size,
  type,
  normalized = false,
  stride = 0,
  offset = 0,
}) => {
  const cGl = gl ? gl : _gl;
  const cBuffer = buffer ? buffer : cGl.createBuffer();

  gl.bindBuffer(bufferType, cBuffer);
  gl.bufferData(bufferType, data, dataMemoryType);
  gl.vertexAttribPointer(attribute, size, type, normalized, stride, offset);
  gl.enableVertexAttribArray(attribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

/**
 * Binds buffers to a WebGL context.
 * @param {Object} options
 * @param {WebGLRenderingContext} options.gl - The WebGL context.
 * @param {WebGLBuffer} options.buffer - The buffer to bind.
 * @param {number} options.bufferType - The type of buffer to bind.
 * @param {TypedArray} options.data - The data to bind.
 * @param {number} options.dataMemoryType - The memory type of the data.
 * @param {Array<{
 *  attribute: number,
 *  size: number,
 *  type: number,
 *  normalized?: boolean,
 *  stride?: number,
 *  offset?: number,
 * }>} options.attributesData - The attributes data to bind.
 */
const bindBuffers = ({
  gl,
  buffer,
  bufferType,
  data,
  dataMemoryType,
  attributesData,
}) => {
  const cGl = gl ? gl : _gl;
  const cBuffer = buffer ? buffer : cGl.createBuffer();

  gl.bindBuffer(bufferType, cBuffer);
  gl.bufferData(bufferType, data, dataMemoryType);

  attributesData.forEach(
    ({ attribute, size, type, normalized = false, stride = 0, offset = 0 }) => {
      gl.vertexAttribPointer(attribute, size, type, normalized, stride, offset);
      gl.enableVertexAttribArray(attribute);
    }
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

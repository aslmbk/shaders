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
 * @param {WebGLRenderingContext} [options.gl] - The WebGL context.
 * @param {string} options.elementName - The name of the canvas element.
 * @param {string} options.contextName - The name of the context.
 * @param {string} options.vertexShader - The vertex shader.
 * @param {string} options.fragmentShader - The fragment shader.
 * @returns {{
 *  gl: WebGLRenderingContext,
 *  program: WebGLProgram,
 * }} The WebGL context and program.
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

  return { gl: gl, program };
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
const bindBuffer = ({ gl, data, attribute, size, type }) => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attribute, size, type || gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

/**
 * Binds buffers to a WebGL context.
 * @param {Object} options
 * @param {WebGLRenderingContext} options.gl - The WebGL context.
 * @param {WebGLBuffer} options.buffer - The buffer to bind.
 * @param {number} options.bufferType - The type of buffer to bind.
 * @param {Float32Array} options.data - The data to bind.
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
const bindBuffers = ({ gl, data, attributesData }) => {
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  const FSIZE = data.BYTES_PER_ELEMENT;
  attributesData.forEach(
    ({
      attribute,
      size,
      type = gl.FLOAT,
      normalized = false,
      stride = 0,
      offset = 0,
    }) => {
      gl.vertexAttribPointer(
        attribute,
        size,
        type,
        normalized,
        stride * FSIZE,
        offset * FSIZE
      );
      gl.enableVertexAttribArray(attribute);
    }
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};

/**
 * Creates a 2D texture.
 * @param {Object} options
 * @param {WebGLRenderingContext} options.gl - The WebGL context.
 * @param {number} [options.textureCell] - The texture cell.
 * @param {number} [options.minFilterType] - The min filter type.
 * @param {number} [options.textureDataType] - The texture data type.
 * @param {number} [options.textureDataFormat] - The texture data format.
 * @param {WebGLUniformLocation} options.textureLocation - The texture location.
 * @param {number} options.textureLocationIndex - The texture location index.
 * @param {string} options.imageSrc - The image source.
 */
const create2DTexture = ({
  gl,
  textureCell,
  minFilterType,
  textureDataType,
  textureDataFormat,
  textureLocation,
  textureLocationIndex,
  imageSrc,
}) => {
  const texture = gl.createTexture();
  const image = new Image();
  image.onload = () => {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(textureCell || gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      minFilterType || gl.NEAREST
    );
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      textureDataFormat || gl.RGBA,
      textureDataFormat || gl.RGBA,
      textureDataType || gl.UNSIGNED_BYTE,
      image
    );
    gl.uniform1i(textureLocation, textureLocationIndex);
  };
  image.src = imageSrc;
};

import { fragmentShaderCode } from "app/[lang]/app/_utils/fragment-shader-code"
import { vertexShaderCode } from "app/[lang]/app/_utils/vertex-shader-code"

export const runAnimation = (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext("webgl", {
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  })

  if (context === null) return null

  const program = context.createProgram()

  if (program === null) return null

  const vertexShader = context.createShader(context.VERTEX_SHADER)

  if (vertexShader === null) return null

  context.shaderSource(vertexShader, vertexShaderCode)

  context.compileShader(vertexShader)

  context.attachShader(program, vertexShader)

  const vertexShaderLog = context.getShaderInfoLog(vertexShader)

  const fragmentShader = context.createShader(context.FRAGMENT_SHADER)

  if (fragmentShader === null) return null

  context.shaderSource(fragmentShader, fragmentShaderCode)

  context.compileShader(fragmentShader)

  context.attachShader(program, fragmentShader)

  const fragmentShaderLog = context.getShaderInfoLog(fragmentShader)

  if (vertexShaderLog === null || fragmentShaderLog === null) return null

  context.linkProgram(program)

  const isRunning = Boolean(
    context.getProgramParameter(program, context.LINK_STATUS),
  )

  context.useProgram(program)

  const uniformLocations = {
    time: context.getUniformLocation(program, "time"),
    resolution: context.getUniformLocation(program, "resolution"),
  }

  context.bindBuffer(context.ARRAY_BUFFER, context.createBuffer())

  context.bufferData(
    context.ARRAY_BUFFER,
    new Float32Array([-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0]),
    context.STATIC_DRAW,
  )

  const attributeLocation = context.getAttribLocation(program, "position")

  context.enableVertexAttribArray(attributeLocation)

  context.vertexAttribPointer(attributeLocation, 3, context.FLOAT, false, 0, 0)

  context.clearColor(0, 0, 0, 0)

  const startTime = new Date().getTime()

  const render = () => {
    if (!isRunning) return

    const viewportWidth = window.innerWidth / 1

    const viewportHeight = window.innerHeight / 1

    canvas.width = viewportWidth

    canvas.height = viewportHeight

    context.viewport(0, 0, viewportWidth, viewportHeight)

    const elapsedTime = (new Date().getTime() - startTime) * 0.001

    context.clear(context.COLOR_BUFFER_BIT)

    context.uniform1f(uniformLocations.time, elapsedTime)

    context.uniform2fv(uniformLocations.resolution, [
      viewportWidth,
      viewportHeight,
    ])

    context.drawArrays(context.TRIANGLE_STRIP, 0, 4)

    context.flush()

    requestAnimationFrame(render)
  }

  render()
}

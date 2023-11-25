export const fragmentShaderCode = `precision mediump float;

#define ZOOM_FACTOR 0.4
#define SPEED_FACTOR 0.4
#define TAU 6.28318530718

precision highp float;
uniform float time;
uniform vec2 resolution;

float inverse(float x) {
  return 1.0 / x;
}

mat2 rotationMatrix(float angle) {
  return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float circleShape(vec2 pos, float radius) {
  return step(length(pos), radius);
}

void main(void) {
  vec2 pos = (gl_FragCoord.xy - resolution * 0.5) * inverse(ZOOM_FACTOR) / min(resolution.x, resolution.y);

  vec3 color;
  float t = mod(time * (SPEED_FACTOR * 0.8), TAU);
  color = mix(vec3(1.0, 0.8, 0.8), vec3(0.8, 0.8, 1.0), sin(t) * 0.5 + 0.5);

  pos *= rotationMatrix(time * SPEED_FACTOR / 32.0);
  pos.x += 0.1 * sin(2.0 * (pos.y + time * SPEED_FACTOR * 0.1) + time);
  pos.y += 0.1 * cos(6.0 * (pos.x + time * SPEED_FACTOR * 0.1) + time);

  float beat = mod(time * SPEED_FACTOR, 1.0);
  float heartbeat = smoothstep(0.4, 0.5, beat) - smoothstep(0.4, 0.6, beat);
  heartbeat = 1.0 - heartbeat * 0.04;

  color *= circleShape(pos, heartbeat);

  gl_FragColor = vec4(color, circleShape(pos, heartbeat));
}`

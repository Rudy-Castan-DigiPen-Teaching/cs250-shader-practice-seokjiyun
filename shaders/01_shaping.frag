#version 300 es
precision mediump float;

/**
 * \file 01_shaping.farg
 * \author Rudy Castan
 * \author Jiyun Seok
 * \date 2025 Spring
 * \par CS250 Computer Graphics II
 * \copyright DigiPen Institute of Technology
 */

out vec4 FragColor;

uniform vec2 u_resolution;
uniform float u_time;

float smooth_circle(vec2 st, vec2 center, float radius, float edge) {
  return smoothstep(radius, radius - edge, distance(st, center));
}

float plot(float st, float pct) {
  return smoothstep(pct - 0.01, pct, st) - smoothstep(pct, pct + 0.01, st);
}

mat2 rotate(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 st = gl_FragCoord.xy / u_resolution;
  
  vec3 bgColor;
  bgColor.r = 0.5 + 0.5 * sin(u_time + st.x * 5.0);
  bgColor.g = 0.5 + 0.5 * cos(u_time + st.y * 5.0);
  bgColor.b = 0.5 + 0.5 * sin(u_time + st.x * 5.0 + st.y * 5.0);
  
  float bgPattern = sin(u_time + st.x * 10.0) * cos(u_time + st.y * 10.0);
  bgColor += 0.2 * vec3(bgPattern);

  vec2 circlePos = vec2(0.5) + vec2(0.25 * sin(u_time * 2.0), 0.25 * sin(u_time * 3.0));
  float circleMask = smooth_circle(st, circlePos, 0.15, 0.005);
  vec3 baseCircleColor = vec3(0.0, 0.8, 1.0);

  vec2 stLine = st;
  stLine = (stLine - 0.5);          
  stLine = rotate(u_time) * stLine; 
  stLine += 0.5;               
  

  float linePct = 0.5 + 0.3 * sin(u_time * 1.5);
  float lineMask = plot(stLine.x, linePct);
  vec3 lineColor = vec3(1.0, 0.2, 0.8);

  float overlap = circleMask * lineMask;
  vec3 circleColor = mix(baseCircleColor, vec3(1.0, 1.0, 0.0), overlap);
  
  vec3 shapeColor = circleColor * circleMask + lineColor * lineMask;
  vec3 finalColor = mix(bgColor, shapeColor, max(circleMask, lineMask));
  
  FragColor = vec4(finalColor, 1.0);
}
#version 300 es

precision mediump float;

/**
 * \file
 * \author Jiyun Seok
 * \date 2025 Spring
 * \par CS250 Computer Graphics II
 * \copyright DigiPen Institute of Technology
 */

out vec4 FragColor;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Convert pixel coords to normalized coords
vec2 to_coord(vec2 pixel_point)
{
    vec2 point = pixel_point / u_resolution;
    if (u_resolution.x > u_resolution.y)
    {
        // Wide viewport: scale x, then recenter
        point.x *= u_resolution.x / u_resolution.y;
        point.x += (u_resolution.y - u_resolution.x) / u_resolution.x;
    }
    else
    {
        // Tall viewport: scale y, then recenter
        point.y *= u_resolution.y / u_resolution.x;
        point.y += (u_resolution.x - u_resolution.y) / u_resolution.y;
    }
    return point;
}

// Signed distance from point to circle boundary
float sCircle(vec2 point, vec2 center, float radius)
{
    return distance(point, center) - radius;
}

// Anti-aliased circle mask: returns 1.0 inside the circle, 0.0 outside
float circle(vec2 point, vec2 center, float radius)
{
    float sd = sCircle(point, center, radius);
    float E = fwidth(sd);
    return 1.0 - smoothstep(-E, E, sd);
}

void main(void)
{
    // Screen position in normalized coordinates
    vec2 position = to_coord(gl_FragCoord.xy);
    vec2 uv = position;  // UV coordinates in [0, 1]

    // Vibrant dynamic background
    // Modulate RGB channels over time and position using cosine waves
    vec3 bg = 0.5 + 0.5 * cos(u_time + uv.xyx * 10.0 + vec3(0.0, 2.0, 4.0));
    vec3 color = bg;


    // Animated white circle
    float radius1 = 0.06 + 0.03 * sin(u_time * 1.2);
    vec2 p1 = vec2(cos(u_time), sin(u_time)) * 0.25 + vec2(0.5);
    float t1 = circle(position, p1, radius1);
    color = mix(color, vec3(1.0), t1);

    // Secondary cyan-green circle
    float radius3 = 0.05 + 0.02 * sin(u_time * 2.0);
    vec2 p3 = vec2(sin(u_time), cos(u_time)) * 0.123 + vec2(0.5);
    float t3 = circle(position, p3, radius3);
    color = mix(color, vec3(0.0, 1.0, 0.3333), t3);

    // Red orbiting circle around the mouse
    vec2 mousePos = to_coord(u_mouse);
    float orbitRadius = 0.2;
    vec2 orbit = vec2(sin(u_time * 0.8), cos(u_time * 0.8)) * orbitRadius;
    vec2 orbitCenter = mousePos + orbit;
    float radius2 = 0.05 + 0.015 * sin(u_time * 3.0);
    float t2 = circle(position, orbitCenter, radius2);
    color = mix(color, vec3(1.0, 0.0, 0.0), t2);

    // Pulsing yellow circle at the mouse position
    float radiusMouse = 0.005 + 0.005 * sin(u_time * 4.0);
    float t_mouse = circle(position, mousePos, radiusMouse);
    color = mix(color, vec3(1.0, 1.0, 0.0), t_mouse);

    FragColor = vec4(color, 1.0);
}

#version 300 es
precision mediump float;

#define TWO_PI 6.28318530718

/**
* \file 03_HSB.frag
* \author Jiyun Seok
* \date 2025 Spring
* \par CS250 Computer Graphics II
* \copyright DigiPen Institute of Technology
*/

out vec4 FragColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse; // x,y: mouse position in pixels, z: (unused here)
uniform float u_key;  // set > 0.0 when the "0" key is pressed

// Function to convert HSV (or HSB) to RGB (adapted from Iñigo Quiles)
vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(
        abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0,
        0.0,
        1.0
    );
    rgb = rgb * rgb * (6.0 - 2.0 * rgb);
    return c.z * mix(vec3(0.8431), rgb, c.y);
}

void main() {
    // Normalize fragment coordinates to [0, 1]
    vec2 st = gl_FragCoord.xy / u_resolution;
    
    // Center coordinates for polar conversion
    vec2 center = vec2(0.5);
    vec2 toCenter = st - center;
    
    // Calculate polar coordinates: angle in radians (-PI to PI) and radius
    float angle = atan(toCenter.y, toCenter.x);
    float radius = length(toCenter);
    
    // Create a dynamic swirling effect by modifying the angle with time and speed
    float dynamicAngle = angle + u_time ;
    
    // Generate a geometric stripe pattern using the dynamic angle
    float stripes = abs(sin(10.0 * dynamicAngle));
    // Limit the pattern to a ring using radius (adjust smoothstep thresholds as desired)
    float pattern = smoothstep(0.2, 0.25, radius) * stripes;
    
    // Compute hue based on the dynamic angle (normalized to 0-1) 
    // and add an offset from the mouse's x-position (normalized)
    float hue = mod(dynamicAngle / TWO_PI + 0.5 + (u_mouse.x / u_resolution.x) * 0.1, 1.0);
    
    // Use radius to modulate saturation (or brightness) if desired
    float saturation = mix(0.5, 1.0, radius);
    float brightness = 1.0;
    
    // Convert HSV to RGB for the base color
    vec3 color = hsb2rgb(vec3(hue, saturation, brightness));
    
    // Mix the base color with black based on the pattern to create geometric shapes
    color = mix(color, vec3(0.0), pattern);
    
    FragColor = vec4(color, 1.0);
}

#version 300 es
precision mediump float;
/**
* \file 02_color.frag
* \author Jiyun Seok
* \date 2025 Spring
* \par CS250 Computer Graphics II
* \copyright DigiPen Institute of Technology
*/

uniform vec2 u_resolution;
uniform float u_time;

out vec4 FragColor;

// plot function: returns a value close to 1 when st.y is near pct, emphasizing the line.
float plot(vec2 st, float pct) {
    return smoothstep(pct - 0.01, pct, st.y) - smoothstep(pct, pct + 0.01, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    // Adjust x coordinate for the aspect ratio
    st.x *= u_resolution.x / u_resolution.y;
    
    // Set region boundaries
    float horizon = 0.70; // boundary between sky and ocean
    float beach   = 0.20; // boundary between sand (beach) and ocean (small beach region)
    
    // Cycle-based day/night cycle (range 0 ~ 2.0)
    float cycle = mod(u_time * 0.1, 2.0);
    // dayFactor: 1 means day (sun visible), 0 means night (moon visible)
    float dayFactor = 0.0;
    if(cycle < 1.0) {
        dayFactor = (cycle < 0.05) ? smoothstep(0.2, 1.1, cycle) : 1.0;
    } else {
        // Evening transition (sun disappears → moon appears)
        dayFactor = (cycle < 0.55) ? smoothstep(1.2, 1.99, cycle) : 0.0;
    }
    
    // Colors for each region based on day/night
    vec3 skyDay   = vec3(0.53, 0.81, 0.92);
    vec3 skyNight = vec3(0.05, 0.05, 0.2);
    vec3 skyColor = mix(skyNight, skyDay, dayFactor);
    
    vec3 oceanDay   = vec3(0.0, 0.5, 0.7);
    vec3 oceanNight = vec3(0.0, 0.2, 0.35);
    vec3 oceanColor = mix(oceanNight, oceanDay, dayFactor);
    
    vec3 sandDay   = vec3(0.93, 0.79, 0.69);
    vec3 sandNight = vec3(0.5, 0.45, 0.38);
    vec3 sandColor = mix(sandNight, sandDay, dayFactor);
    
    // Smooth transitions between regions: sand ↔ ocean ↔ sky
    float sandBlend = smoothstep(beach, beach + 0.02, st.y);
    float skyBlend  = smoothstep(horizon - 0.02, horizon, st.y);
    vec3 baseColor = mix(sandColor, oceanColor, sandBlend); // sand and ocean
    baseColor = mix(baseColor, skyColor, skyBlend);          // (sand+ocean) and sky
    
    // Use the plot function to emphasize the horizon line (brighten it slightly)
    float horizonLine = plot(st, horizon);
    baseColor = mix(baseColor, vec3(1.0), horizonLine * 0.2);
    
    // Forward-moving wave effect: applied in the region between the beach and the horizon
    if(st.y > beach && st.y < horizon) {
        float wave1 = 0.015 * sin(st.x * 30.0 + (st.y + u_time * 0.3) * 10.0);
        float wave2 = 0.010 * sin(st.x * 20.0 + (st.y + u_time * 0.5) * 15.0);
        float wave = wave1 + wave2;
        baseColor += vec3(wave);
    }
    
    // Draw the sun or the moon based on dayFactor
    if(dayFactor > 0.5) {
        // Day: draw the sun (only visible when above the horizon)
        float sunX = mod(u_time * 0.1, 1.0) - 0.2;
        float sunY = 0.95 - abs(sunX - 0.5) * 0.6;
        vec2 sunPos = vec2(sunX, sunY);
        
        float sunRadius = 0.07;
        float dSun = distance(st, sunPos);
        float sunCircle = smoothstep(sunRadius, sunRadius - 0.02, dSun);
        
        if(sunPos.y > horizon) {
            vec3 sunColor = vec3(1.0, 0.9, 0.6);
            baseColor = mix(baseColor, sunColor, sunCircle);
        }
    } else {
        // Night: draw the moon (the sun is not visible)
        float moonX = mod(u_time * 0.1 + 1.1, 1.0) - 0.2;
        float moonY = 0.95 - abs(moonX - 0.5) * 0.6;
        vec2 moonPos = vec2(moonX, moonY);
        
        float moonRadius = 0.06;
        float dMoon = distance(st, moonPos);
        float moonCircle = smoothstep(moonRadius, moonRadius - 0.02, dMoon);
        vec3 moonColor = vec3(1.0, 1.0, 1.0);
        
        baseColor = mix(baseColor, moonColor, moonCircle);
    }
    
    FragColor = vec4(baseColor, 1.0);
}

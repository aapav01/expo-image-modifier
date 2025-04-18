// Fragment shader for rendering images and overlays in OpenGL
precision mediump float;

uniform sampler2D u_texture; // The texture to render
varying vec2 v_texCoord; // The texture coordinates passed from the vertex shader

void main() {
    // Sample the texture color at the given texture coordinates
    vec4 color = texture2D(u_texture, v_texCoord);

    // Output the final color
    gl_FragColor = color;
}

#version 300 es

in vec2 position;
in vec2 texCoord;

out vec2 vTexCoord;

uniform mat4 modelViewProjection;

void main() {
    gl_Position = modelViewProjection * vec4(position, 0.0, 1.0);
    vTexCoord = texCoord;
}

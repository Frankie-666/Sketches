// mountain.frag
#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
varying vec3 vNormal;
uniform sampler2D texture;
uniform sampler2D textureBg;
uniform float uFogOffset;
uniform float uMaxRange;
uniform float uFadeInRange;

const float PI = 3.141592657;
const float TwoPI = PI * 2.0;

float fogFactorExp2(const float dist, const float density) {
  const float LOG2 = -1.442695;
  float d = density * dist;
  return 1.0 - clamp(exp2(d * d * LOG2), 0.0, 1.0);
}

vec2 envMapEquirect(vec3 wcNormal, float flipEnvMap) {
  float phi = acos(-wcNormal.y);
  float theta = atan(flipEnvMap * wcNormal.x, wcNormal.z) + PI;
  return vec2(theta / TwoPI, phi / PI);
}

vec2 envMapEquirect(vec3 wcNormal) {
    return envMapEquirect(wcNormal, -1.0);
}

#define FOG_DENSITY 0.05
const vec3 fogColor = vec3(254.0/255.0, 242.0/255.0, 226.0/255.0);

void main(void) {

	float fogDistance = gl_FragCoord.z / gl_FragCoord.w;
	float fogAmount = fogFactorExp2(fogDistance, FOG_DENSITY);

	const float MIN_Y = 0.005;
	float opacity = smoothstep(0.0, MIN_Y, vPosition.y );

	vec4 color = texture2D(texture, vTextureCoord);
	color.rgb = mix(color.rgb, fogColor, fogAmount+uFogOffset);

	float distOffset = 0.0;
	const float rangeOffset = 1.75;
	if(vPosition.z < -uFadeInRange) {
		distOffset = smoothstep(-uMaxRange+uFadeInRange+rangeOffset, -uMaxRange+rangeOffset, vPosition.z);
	}
	color.rgb = mix(color.rgb, fogColor, distOffset);
	color *= opacity;


	vec2 uv = envMapEquirect(vNormal);
	vec3 colorEnv = texture2D(textureBg, uv).rgb;
	color.rgb *= mix(colorEnv, vec3(1.0), .75);

  

	gl_FragColor = color;
}
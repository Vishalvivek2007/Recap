/**
 * Vertex shader: displaces sphere vertices using simplex noise.
 * Audio amplitude amplifies the displacement.
 * Time creates organic, living motion.
 */
export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAudioLevel;
  uniform float uDistortion;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  // -- Simplex noise (Ashima Arts, MIT) ---------------------------------
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  // ----------------------------------------------------------------------

  void main() {
    vNormal = normal;

    // Layered noise — two octaves, halved speeds for calm motion
    float n1 = snoise(position * 1.5 + vec3(uTime * 0.15));
    float n2 = snoise(position * 3.0 + vec3(uTime * 0.25));
    float noise = n1 * 0.6 + n2 * 0.4;

    // Reduced displacement — surface ripples gently instead of thrashing
    float audioBoost = 0.3 + uAudioLevel * 0.9;
    float displacement = noise * uDistortion * audioBoost;
    vDisplacement = displacement;

    vec3 newPosition = position + normal * displacement;
    vPosition = newPosition;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

/**
 * Fragment shader: deep iridescent pearl look.
 * Dark center, thin-film rainbow sheen at the rim only.
 * Audio shifts hue phase, never blows out luminance.
 */
export const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uAudioLevel;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    // Fresnel: 0 at center (facing camera), 1 at rim (glancing angle)
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = 1.0 - max(dot(viewDir, normalize(vNormal)), 0.0);
    fresnel = pow(fresnel, 2.0);

    // Thin-film phase: position variation + slow time + gentle audio hue shift
    // Audio moves the color through the palette — NOT brightness
    float filmPhase = vDisplacement * 3.0 + uTime * 0.04 + uAudioLevel * 0.22;

    // Dark/desaturated brand palette: deep indigo → dark rose → dark amber
    vec3 c0 = vec3(0.18, 0.10, 0.50);
    vec3 c1 = vec3(0.46, 0.14, 0.30);
    vec3 c2 = vec3(0.46, 0.26, 0.06);

    float seg = fract(filmPhase) * 3.0;
    vec3 iridescent;
    if (seg < 1.0) {
      iridescent = mix(c0, c1, smoothstep(0.0, 1.0, seg));
    } else if (seg < 2.0) {
      iridescent = mix(c1, c2, smoothstep(0.0, 1.0, seg - 1.0));
    } else {
      iridescent = mix(c2, c0, smoothstep(0.0, 1.0, seg - 2.0));
    }

    // Center stays dark — iridescence lives at the rim only
    float rim = pow(fresnel, 1.8);
    vec3 darkBase = vec3(0.04, 0.03, 0.10);
    vec3 color = mix(darkBase, iridescent, rim);

    // Audio: gently brightens rim sheen — no luminance pump at center
    color += iridescent * rim * uAudioLevel * 0.28;

    // Slow rimlight shimmer
    color += vec3(sin(uTime * 0.6 + vPosition.y * 3.0) * 0.012) * rim;

    // Hard brightness cap — prevents any blowout regardless of audio
    color = clamp(color, vec3(0.0), vec3(0.88, 0.72, 0.95));

    gl_FragColor = vec4(color, 1.0);
  }
`;

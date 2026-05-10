// fluid.js — Professional WebGL Fluid Marble Background
// Architecture: 3-pass ping-pong pipeline
// Upgrades: Autonomous ambient flow, Ridge-noise, High-contrast filament mapping

import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
let displayMat;
export const initFluid = () => {
    const canvas = document.getElementById('fluid-canvas');
    if (!canvas) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    // ─── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true, // This is mandatory
        premultipliedAlpha: false, // Helps with transparency blending
        powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0); // Clear to transparent
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.autoClear = false;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const planeGeo = new THREE.PlaneGeometry(2, 2);

    // ─── Simulation Resolutions ───────────────────────────────────────────────
    const SIM_RES = 512;
    const DYE_RES = 1024;

    // ─── Render Targets ───────────────────────────────────────────────────────
    const makeRT = (w, h) => new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.HalfFloatType,
        depthBuffer: false,
        stencilBuffer: false,
    });

    let velRead = makeRT(SIM_RES, SIM_RES), velWrite = makeRT(SIM_RES, SIM_RES);
    let dyeRead = makeRT(DYE_RES, DYE_RES), dyeWrite = makeRT(DYE_RES, DYE_RES);

    // ─── Shared Vertex Shader ─────────────────────────────────────────────────
    const vert = /* glsl */`
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `;

    // ─── Shared Noise Functions ───────────────────────────────────────────────
    const noiseInclude = /* glsl */`
        vec2 hash2(vec2 p) {
            p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
            return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }
        float gnoise(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(
                mix(dot(hash2(i), f), dot(hash2(i+vec2(1,0)), f-vec2(1,0)), u.x),
                mix(dot(hash2(i+vec2(0,1)), f-vec2(0,1)), dot(hash2(i+vec2(1,1)), f-vec2(1,1)), u.x), u.y);
        }
    `;

    // ─── Pass 1: Velocity Field ───────────────────────────────────────────────
    const velFrag = /* glsl */`
        precision highp float;
        ${noiseInclude}
        
        uniform sampler2D tVel;
        uniform vec2      uMouse;
        uniform vec2      uMouseVel;
        uniform float     uDissipation;
        uniform float     uTime;
        varying vec2 vUv;

        void main() {
            vec2 vel = texture2D(tVel, vUv).xy;
            
            // Advection
            vec2 back = clamp(vUv - vel * 0.01, 0.001, 0.999);
            vel = texture2D(tVel, back).xy * uDissipation;

            // AMBIENT TURBULENCE: This applies a constant, slow churning force 
            // to the entire screen so the background is always alive.
            vec2 noiseForce = vec2(
                gnoise(vUv * 6.0 + uTime * 0.15),
                gnoise(vUv * 6.0 - uTime * 0.15 + 100.0)
            ) * 0.0006;
            vel += noiseForce;

            // Mouse Injection
            vec2 d = vUv - uMouse;
            float splat = exp(-dot(d, d) / 0.01); 
            vel += uMouseVel * splat * 1.5;

            // Boundary clamp
            vel *= smoothstep(0.0, 0.02, vUv.x) * smoothstep(1.0, 0.98, vUv.x);
            vel *= smoothstep(0.0, 0.02, vUv.y) * smoothstep(1.0, 0.98, vUv.y);

            gl_FragColor = vec4(vel, 0.0, 1.0);
        }
    `;

    // ─── Pass 2: Dye Field ────────────────────────────────────────────────────
    const dyeFrag = /* glsl */`
        precision highp float;
        ${noiseInclude}

        uniform sampler2D tDye;
        uniform sampler2D tVel;
        uniform vec2      uMouse;
        uniform vec2      uMouseVel;
        uniform float     uDissipation;
        uniform float     uTime;
        varying vec2 vUv;

        void main() {
            vec2 vel = texture2D(tVel, vUv).xy;
            
            vec2 back = clamp(vUv - vel * 0.015, 0.001, 0.999);
            float dye = texture2D(tDye, back).r * uDissipation;

            // Mouse Splat
            vec2 d = vUv - uMouse;
            float speed = length(uMouseVel);
            
            float brushNoise = gnoise(vUv * 50.0 + uTime) * 0.5 + 0.5;
            float radius = 0.01 + speed * 0.005;
            
            float splat = exp(-dot(d, d) / radius) * brushNoise;
            dye += splat * min(speed * 100.0, 1.0);

            gl_FragColor = vec4(vec3(clamp(dye, 0.0, 1.0)), 1.0);
        }
    `;

    // ─── Pass 3: Display ──────────────────────────────────────────────────────
    const displayFrag = /* glsl */`
        precision highp float;
        ${noiseInclude}

        uniform sampler2D tDye;
        uniform sampler2D tVel;
        uniform float     uTime;
        uniform vec2      uResolution;
        uniform bool      uIsLight; 
        varying vec2 vUv;

        float ridgeFBM(vec2 p) {
            float v = 0.0, a = 0.5;
            mat2 m = mat2(cos(0.6), sin(0.6), -sin(0.6), cos(0.6));
            for (int i = 0; i < 6; i++) {
                float n = 1.0 - abs(gnoise(p)); 
                v += a * n * n; 
                p = m * p * 2.1 + vec2(1.5);
                a *= 0.45;
            }
            return v;
        }

        void main() {
            vec2 uv = vUv;
            float ar = uResolution.x / uResolution.y;
            vec2 p = (vec2(uv.x * ar, uv.y) - 0.5) * 1.6 + 0.5;
            
            vec2 vel = texture2D(tVel, uv).xy;
            float dyeMask = texture2D(tDye, uv).r;

            // Coordinate Warp
            vec2 warpedP = p * 4.0 + vel * 3.0 + vec2(uTime * 0.06, -uTime * 0.04);

            // Domain Warping
            vec2 q = vec2(ridgeFBM(warpedP + uTime * 0.1), ridgeFBM(warpedP + vec2(5.2, 1.3)));
            vec2 r = vec2(ridgeFBM(warpedP + 4.0 * q + vec2(1.7, 9.2)), ridgeFBM(warpedP + 4.0 * q + vec2(8.3, 2.8)));

            // Noise structure
            float structure = ridgeFBM(warpedP + 3.0 * r);
            
            // Interaction mapping
            float smoke = smoothstep(0.3, 0.8, structure);
            float activeDye = smoke * smoothstep(0.0, 0.4, dyeMask);
            float finalVisual = pow(max(smoke * 0.2, activeDye), 1.2);
            
            // Add vignette
            finalVisual *= smoothstep(0.8, 0.3, length(uv - 0.5));

            // THEME LOGIC:
            
            vec3 fluidColor = uIsLight ? vec3(0.1, 0.1, 0.1) : vec3(1.0, 0.2, 0.6); 
            
            // Output color + alpha based on fluid density
            gl_FragColor = vec4(fluidColor, finalVisual);
        }
    `;

    // ─── Materials ────────────────────────────────────────────────────────────
    const velMat = new THREE.ShaderMaterial({
        uniforms: {
            tVel: { value: null },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uMouseVel: { value: new THREE.Vector2(0, 0) },
            uDissipation: { value: 0.98 },
            uTime: { value: 0 },
        },
        vertexShader: vert,
        fragmentShader: velFrag,
    });

    const dyeMat = new THREE.ShaderMaterial({
        uniforms: {
            tDye: { value: null },
            tVel: { value: null },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uMouseVel: { value: new THREE.Vector2(0, 0) },
            uDissipation: { value: 0.965 }, // Slightly faster fade for clean mouse trails
            uTime: { value: 0 },
        },
        vertexShader: vert,
        fragmentShader: dyeFrag,
    });

    // Inside fluid.js, find the displayMat declaration:
    const displayMat = new THREE.ShaderMaterial({

        uniforms: {
            tDye: { value: null },
            tVel: { value: null },
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uIsLight: { value: false} // Default state
        },

        vertexShader: vert,
        fragmentShader: displayFrag,
        transparent: true,
    });

    // ─── Per-pass Scenes ──────────────────────────────────────────────────────
    const velScene = new THREE.Scene();
    const dyeScene = new THREE.Scene();
    const displayScene = new THREE.Scene();

    velScene.add(new THREE.Mesh(planeGeo, velMat));
    dyeScene.add(new THREE.Mesh(planeGeo, dyeMat));
    displayScene.add(new THREE.Mesh(planeGeo, displayMat));

    // ─── Mouse Tracking ───────────────────────────────────────────────────────
    let mx = 0.5, my = 0.5, pmx = 0.5, pmy = 0.5;

    window.addEventListener('mousemove', (e) => {
        mx = e.clientX / window.innerWidth;
        my = 1.0 - e.clientY / window.innerHeight;
    });

    window.addEventListener('resize', () => {
        const nw = window.innerWidth, nh = window.innerHeight;
        renderer.setSize(nw, nh);
        displayMat.uniforms.uResolution.value.set(nw, nh);
    });

    // ─── Render Loop ──────────────────────────────────────────────────────────
    let lastT = 0;

    function step(t) {
        const dt = Math.min((t - lastT) * 0.001, 0.033);
        const timeSec = t * 0.001;
        lastT = t;

        const cap = 4.0;
        const idt = 1.0 / (dt + 0.0001);
        const mvx = Math.max(-cap, Math.min(cap, (mx - pmx) * idt)) * 0.001;
        const mvy = Math.max(-cap, Math.min(cap, (my - pmy) * idt)) * 0.001;
        pmx = mx; pmy = my;

        velMat.uniforms.uTime.value = timeSec;
        dyeMat.uniforms.uTime.value = timeSec;

        // Pass 1: Velocity
        velMat.uniforms.tVel.value = velRead.texture;
        velMat.uniforms.uMouse.value.set(mx, my);
        velMat.uniforms.uMouseVel.value.set(mvx, mvy);
        renderer.setRenderTarget(velWrite);
        renderer.render(velScene, camera);
        [velRead, velWrite] = [velWrite, velRead];

        // Pass 2: Dye
        dyeMat.uniforms.tDye.value = dyeRead.texture;
        dyeMat.uniforms.tVel.value = velRead.texture;
        dyeMat.uniforms.uMouse.value.set(mx, my);
        dyeMat.uniforms.uMouseVel.value.set(mvx, mvy);
        renderer.setRenderTarget(dyeWrite);
        renderer.render(dyeScene, camera);
        [dyeRead, dyeWrite] = [dyeWrite, dyeRead];

        // Pass 3: Display
        displayMat.uniforms.tDye.value = dyeRead.texture;
        displayMat.uniforms.tVel.value = velRead.texture;
        displayMat.uniforms.uTime.value = timeSec;
        renderer.setRenderTarget(null);
        renderer.render(displayScene, camera);

        requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
};


export const updateFluidTheme = (isLight) => {
    // Access the displayMat uniform
    if (displayMat) {
        displayMat.uniforms.uIsLight.value = isLight;
    }
};
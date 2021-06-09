import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { vertexShader, fragmentShader } from "./shader";
import AucklandHeightMap from '../static/textures/auckland-harbour-cropped.png';
import AucklandBaseColor from "../static/textures/auckland-texture-cropped.jpg";
import WaterNormals from '../static/textures/waternormals.jpg';
import { Water } from 'three/examples/jsm/objects/Water.js';

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

/**
 * Create Terrain
 */
const heightMap = textureLoader.load(AucklandHeightMap, (texture) => {
    texture.encoding = THREE.sRGBEncoding;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
});
const textureMap = textureLoader.load(AucklandBaseColor, (texture) => {
    texture.encoding = THREE.sRGBEncoding;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
});
const geometry = new THREE.PlaneBufferGeometry(1024, 1024, 256, 256);
const material = new THREE.ShaderMaterial({
    uniforms: {
        // Feed the heightmap
        bumpTexture: { value: heightMap },
        // Feed the scaling constant for the heightmap
        bumpScale: { value: 50 },
        // Feed the texture map
        terrainTexture: { value: textureMap }
    },
    // Feed the shaders as strings
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide,
});
const mesh = new THREE.Mesh(geometry, material);
mesh.rotation.set(-Math.PI / 2, 0, 0);
mesh.scale.set(1 / 512, 1 / 512, 1 / 512);
mesh.renderOrder = 1;
scene.add(mesh);

/**
 * Water to see how it interacts with city
 */
//

const sun = new THREE.Vector3();

// Water

const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

const water = new Water(
    waterGeometry,
    {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: textureLoader.load(WaterNormals, function (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined
    }
);
water.rotation.x = - Math.PI / 2;
water.renderOrder = 2;
scene.add(water);


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.001, 1000)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
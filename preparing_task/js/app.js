// Import modules
import * as THREE from './mods/three.module.js'; // библиотека, используемая для создания и отображения 
                                                // анимированной компьютерной 3D графики при разработке веб-приложений.
import Stats from './mods/stats.module.js'; // вспомогательная библиотека, которая дает нам информацию о частоте кадров
import { OrbitControls } from './mods/OrbitControls.js'; // ну чтоб двигалась сцена
import { SceneUtils } from './mods/SceneUtils.js';
import { GUI } from './mods/dat.gui.module.js';

// Global letiables
let mainContainer = document.getElementById('webgl-secne');
//let mainContainer = null;
let fpsContainer
let stats = null;
let camera = null;
let renderer = null;
let scene = null;
let camControls = null;

// Global Meshes
let fire, lamp, mesh_lantern1, mesh_lantern2, mesh_lantern3 = null;

let gui = null;

const loader = new THREE.TextureLoader();

function init() {
    fpsContainer = document.querySelector( '#fps' );
    scene = new THREE.Scene();
    scene.background = loader.load('img/sky.jpg');

    createStats();
    createCamera();
    createControls();
    createMeshes();
    createDirectionalLight();
    createAmbientLight();
    createCtrlBox();
    createRenderer();
    renderer.setAnimationLoop( () => {
            update();
            render();
    } );
}

// Animations
function update(){
    camControls.update( 1 );
    if (typeof mesh_lantern1 !== 'undefined') {
        if (controlBoxParams.mesh_lantern1_speed_up>0) {
            mesh_lantern1.position.y += controlBoxParams.mesh_lantern1_speed_up;
        }
        mesh_lantern1.rotation.y -= controlBoxParams.rotate_speed;
        mesh_lantern1.position.x = controlBoxParams.mesh_lantern1_position;
    }

    if (typeof mesh_lantern2 !== 'undefined') {
        if (controlBoxParams.mesh_lantern2_speed_up>0) {
            mesh_lantern2.position.y += controlBoxParams.mesh_lantern2_speed_up;
        }
        mesh_lantern2.rotation.y -= controlBoxParams.rotate_speed;
        mesh_lantern2.position.x = controlBoxParams.mesh_lantern2_position;
    }

    if (typeof mesh_lantern3 !== 'undefined') {
        if (controlBoxParams.mesh_lantern3_speed_up>0) {
            mesh_lantern3.position.y += controlBoxParams.mesh_lantern3_speed_up;
        }
        mesh_lantern3.rotation.y -= controlBoxParams.rotate_speed;
        mesh_lantern3.position.x = controlBoxParams.mesh_lantern3_position;
    }
}

// Statically rendered content
function render(){
    stats.begin();
    renderer.render( scene, camera );
    stats.end();
}

// FPS counter
function createStats(){
    stats = new Stats();
    stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    fpsContainer.appendChild( stats.dom );
}

let controlBoxParams = {
    mesh_lantern1_speed_up:0,
    mesh_lantern2_speed_up:0,
    mesh_lantern3_speed_up:0,
    rotate_speed:0,
    mesh_lantern1_position:0,
    mesh_lantern2_position:15,
    mesh_lantern3_position:0
};

function createCtrlBox(){
    gui = new GUI();
    gui.remember(controlBoxParams);

    let l1_su = gui.add(controlBoxParams, 'mesh_lantern1_speed_up').min(0).max(0.2).step(0.01).name('L1 speed up');
    l1_su.listen();
    let l2_su = gui.add(controlBoxParams, 'mesh_lantern2_speed_up').min(0).max(0.2).step(0.01).name('L2 speed up');
    l2_su.listen();
    let l3_su = gui.add(controlBoxParams, 'mesh_lantern3_speed_up').min(0).max(0.2).step(0.01).name('L3 speed up');
    l3_su.listen();

    let rs = gui.add(controlBoxParams, 'rotate_speed').min(0).max(0.2).step(0.01).name('Ls rotation speed');
    rs.listen();

    let l1_pos = gui.add(controlBoxParams, 'mesh_lantern1_position').min(-20).max(20).step(1).name('L1 position');
    l1_pos.listen();
    let l2_pos = gui.add(controlBoxParams, 'mesh_lantern2_position').min(-20).max(20).step(1).name('L2 position');
    l2_pos.listen();
    let l3_pos = gui.add(controlBoxParams, 'mesh_lantern3_position').min(-20).max(20).step(1).name('L3 position');
    l3_pos.listen();

}

// Camera object
function createCamera(){
    const fov = 100; //влияет на то, с какого расстояния подгрузится камера от сцены
    const aspect =  mainContainer.clientWidth / mainContainer.clientHeight; //ширина и высота элемента?
    const near = 0.1; // влияет на то, насколько близко мы можем приблизиться к сцене
    const far = 500; // влияет на то, насколько далеко мы можем отдалиться от сцены и все еще видеть ее
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    // поставим камеру красиво
    camera.position.x = 0;
    camera.position.y = -4;
    camera.position.z = 10;
    camera.lookAt(scene.position);
}

// Interactive controls
function createControls(){
    camControls = new OrbitControls(camera, mainContainer);
    camControls.autoRotate = false;
}

// Create directional - sun light
function createDirectionalLight(){
    const dirLight = new THREE.DirectionalLight( 0xffffff, 1, 100 ); // color, intensity, proximity
    dirLight.position.set( 40, 120, 25 );
    // makes the shadows with less blurry edges - детализируем тени
    dirLight.shadow.mapSize.width = 1048;   // default
    dirLight.shadow.mapSize.height = 1048;  // default
    // set light coverage
    dirLight.shadow.camera.near = 0.5;      // default
    dirLight.shadow.camera.far = 150;        // насколько далеко свет идет
    //насколько широко светит источник света
    dirLight.shadow.camera.left = -80;
    dirLight.shadow.camera.top = 80;
    dirLight.shadow.camera.right = 80;
    dirLight.shadow.camera.bottom = -80;
    // enable shadows for light source
    dirLight.castShadow = true;
    scene.add( dirLight );

    // adds helping lines
//     const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 3, 0xcc0000 );
//     scene.add( dirLightHelper );
//     scene.add(new THREE.CameraHelper(dirLight.shadow.camera));
}

function createAmbientLight(){
    // If the want to make the whole scene lighter or add some mood, usually it should be some grey tone
    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.3 ); // 0x111111 - 0xaaaaaa, 1 ; 0xffffff, 0.1 - 0.3; 0x404040
    scene.add( ambientLight );
}

 // Meshes and other visible objects
function createMeshes() {
    mesh_lantern1 = createLantern ();
    scene.add(mesh_lantern1);

    mesh_lantern2 = mesh_lantern1.clone();
    mesh_lantern2.translateX(15.0);
    scene.add(mesh_lantern2);

    mesh_lantern3 = mesh_lantern1.clone();
    mesh_lantern3.translateZ(-20.0);
    scene.add(mesh_lantern3);
}

function createLantern () {
    let mesh = new THREE.Object3D();
    lamp = createLamp(4, 20);
    mesh.add(lamp);
    fire = createFire('img/fire.png');
    mesh.add(fire);
    return mesh;
}

function createFire(texture) {
    const fireTexture = new THREE.TextureLoader().load(texture);
    const fireMaterial = new THREE.SpriteMaterial( { map: fireTexture, color: 0xffffff } );
    // const fireMaterial = new THREE.SpriteMaterial( { map: fireTexture, color: 0xffffff, transparent:true, opacity:0.7 } );
    let mesh = new THREE.Sprite( fireMaterial );
    mesh.scale.set(1, 1, 1);
    return mesh;
}

function createLamp(rotatePrec, heightPrec) {
    const pts = [
        new THREE.Vector2( 2, 0),
        new THREE.Vector2( 2, 1),
        new THREE.Vector2( 2, 2),
        new THREE.Vector2( 3, 3.5),
        new THREE.Vector2( 2, 5),
        new THREE.Vector2( 0, 5),
    ];
    const spline = new THREE.SplineCurve(pts);
    let splineGeometry = new THREE.Geometry();
    splineGeometry.vertices = spline.getPoints(heightPrec);
    const latheGeom = new THREE.LatheGeometry(splineGeometry.vertices, rotatePrec);
    //const latheGeom = new THREE.LatheGeometry(splineGeometry.vertices, rotatePrec, 0, Math.PI);
    const materials = [
        new THREE.MeshLambertMaterial( { opacity:0.5, color: 0xFF0000, transparent:true, side:THREE.DoubleSide} ),
        new THREE.MeshBasicMaterial( { opacity:0.3, color: 0x800000, transparent:true, wireframe: false } )
    ];
    let mesh = SceneUtils.createMultiMaterialObject(latheGeom,materials);
    mesh.children.forEach(function(e) {
        e.castShadow=true;
        e.geometry.computeFaceNormals();
    });
    return mesh;
}

function createRenderer(){
    // set antialiasing on to remove jagged edges
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight);
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
    mainContainer.appendChild( renderer.domElement );
}

init();

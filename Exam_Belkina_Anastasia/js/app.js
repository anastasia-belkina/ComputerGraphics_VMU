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
let clockPlane, clockHand1, clockHand2, axis, meshAxisHand = null;
let gui = null;

const loader = new THREE.TextureLoader();

function init() {
    fpsContainer = document.querySelector( '#fps' );
    scene = new THREE.Scene();
    scene.background = loader.load('img/wall.jpg');
    //scene.background = new THREE.Color( 0xFEFF57 );

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
    if((typeof clockHand1!=='undefined')&&(typeof clockHand2 !== 'undefined')){
		clockHand1.rotation.z -= controlBoxParams.rotateSpeed1;
		clockHand2.rotation.z -= controlBoxParams.rotateSpeed2;
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
    rotateSpeed1: 0.0,
	rotateSpeed2: 0.0,
};

function createCtrlBox(){
    gui = new GUI();
    gui.remember(controlBoxParams);
    let rs1 = gui.add(controlBoxParams, 'rotateSpeed1').min(0).max(0.05).step(0.001).name('Rotation 1');
    rs1.listen();
    let rs2 = gui.add(controlBoxParams, 'rotateSpeed2').min(0).max(0.05).step(0.001).name('Rotation 2');
    rs2.listen();

}

// Camera object
function createCamera(){
    const fov = 20; //влияет на то, с какого расстояния подгрузится камера от сцены
    const aspect =  mainContainer.clientWidth / mainContainer.clientHeight; //ширина и высота элемента?
    const near = 0.1; // влияет на то, насколько близко мы можем приблизиться к сцене
    const far = 500; // влияет на то, насколько далеко мы можем отдалиться от сцены и все еще видеть ее
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    // поставим камеру красиво
    camera.position.x = 4;
	camera.position.y = 10;
	camera.position.z = 30;
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
    dirLight.position.set( 20, 20, 10 );
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
    // const dirLightHelper = new THREE.DirectionalLightHelper( dirLight, 3, 0xcc0000 );
    // scene.add( dirLightHelper );
    // scene.add(new THREE.CameraHelper(dirLight.shadow.camera));
}

function createAmbientLight(){
    // If the want to make the whole scene lighter or add some mood, usually it should be some grey tone
    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 ); // 0x111111 - 0xaaaaaa, 1 ; 0xffffff, 0.1 - 0.3; 0x404040
    scene.add( ambientLight );
}

 // Meshes and other visible objects
function createMeshes() {
    createClock();

    clockHand1 = createClockHand(4, 20);
    clockHand1.translateZ(0.2);
    //scene.add(clockHand1);

    clockHand2 = clockHand1.clone();
    clockHand2.scale.y = -0.7;
    //clockHand2.translateZ(0.2);
    scene.add(clockHand2);
    
    axis = createAxis(4, 20);
    //axis.rotateX = Math.PI;
    axis.translateZ(0.3);
    //scene.add(axis);

    meshAxisHand = new THREE.Object3D();
    meshAxisHand.add(axis);
    meshAxisHand.add(clockHand1);
    scene.add(meshAxisHand);

}

function createAxis(rotatePrec, heightPrec) {
    // const pts = [
    //     new THREE.Vector2(0.2, 0),
    //     new THREE.Vector2(0.2, 0.5),
    //     new THREE.Vector2(0, 0.5),
    // ];
    // const spline = new THREE.SplineCurve(pts);
    // let splineGeometry = new THREE.Geometry();
    // splineGeometry.vertices = spline.getPoints(heightPrec);
    // const latheGeom = new THREE.LatheGeometry(splineGeometry.vertices, rotatePrec);
    // //const latheGeom = new THREE.LatheGeometry(splineGeometry.vertices, rotatePrec, 0, Math.PI);
    // const materials = [
    //     new THREE.MeshLambertMaterial( { opacity:0.8, color: 0xFFFFFF, transparent:true, side:THREE.DoubleSide} ),
    //     //new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } )
    // ];
    // let mesh = SceneUtils.createMultiMaterialObject(latheGeom,materials);
    // mesh.children.forEach(function(e) {
    //     e.castShadow=true;
    //     e.geometry.computeFaceNormals();
    // });
    // return mesh;

    const boxGeometry = new THREE.BoxBufferGeometry(0.5, 0.5, 0.6);
    const boxMaterial = new THREE.MeshLambertMaterial({ opacity:0.8, color: 0xFFFFFF, transparent:true, side:THREE.DoubleSide});
    let mesh = new THREE.Mesh(boxGeometry, boxMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;

}

function createClock(){
	const texture = new THREE.TextureLoader().load( "img/clock.png" );
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 16;
	
    const planeGeometry = new THREE.PlaneBufferGeometry(10,10);
    //const planeMaterial = new THREE.MeshBasicMaterial({color: 0xcccccc});
    const planeMaterial =  new THREE.MeshStandardMaterial({ opacity: 0.8, transparent:true, map: texture, side: THREE.DoubleSide,  alphaTest: 0.5 });
    clockPlane = new THREE.Mesh(planeGeometry,planeMaterial);

    //clockPlane.rotation.x = -0.5*Math.PI;
//	clockPlane.rotation.z = -0.75*Math.PI;
    clockPlane.position.x = 0;
	clockPlane.position.y = 0;
    clockPlane.position.z = 0;

    clockPlane.receiveShadow = true;

    scene.add(clockPlane);
}

function createClockHand(rotatePrec, heightPrec) {
    const pts = [
        new THREE.Vector2(0.1, 0),
        new THREE.Vector2(0.1, 1.5),
        new THREE.Vector2(0.3, 1.5),
        new THREE.Vector2(0, 3)
    ];
    const spline = new THREE.SplineCurve(pts);
    let splineGeometry = new THREE.Geometry();
    splineGeometry.vertices = spline.getPoints(heightPrec);
    const latheGeom = new THREE.LatheGeometry(splineGeometry.vertices, rotatePrec);
    //const latheGeom = new THREE.LatheGeometry(splineGeometry.vertices, rotatePrec, 0, Math.PI);
    const materials = [
        new THREE.MeshLambertMaterial( { opacity:0.8, color: 0xFFFFFF, transparent:true, side:THREE.DoubleSide} ),
        //new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } )
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

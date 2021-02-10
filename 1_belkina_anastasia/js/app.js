// Import modules
import * as THREE from './mods/three.module.js'; // библиотека, используемая для создания и отображения 
                                                // анимированной компьютерной 3D графики при разработке веб-приложений.
import Stats from './mods/stats.module.js'; // вспомогательная библиотека, которая дает нам информацию о частоте кадров
import { OrbitControls } from './mods/OrbitControls.js'; // ну чтоб двигалась сцена

// Global variables
let mainContainer = null;
let fpsContainer
let stats = null;
let camera = null;
let renderer = null;
let scene = null;
let camControls = null;

// Global Meshes
let sphere, cone, plane, box = null;

const loader = new THREE.TextureLoader();

function init() {
        ///if ( THREE.WEBGL.isWebGLAvailable() === false ) container.appendChild( WEBGL.getWebGLErrorMessage() );
        fpsContainer = document.querySelector( '#fps' );
        mainContainer = document.querySelector( '#webgl-secne' ); // то, куда мы будем накидывать наши объекты
        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0x1F85DE );// http://www.colorpicker.com/

        createStats();
        createCamera();
        createControls();
        createMeshes();
        createDirectionalLight();
        createAmbientLight();
        createRenderer();

        renderer.setAnimationLoop( () => {
                update();
                render();
        } );
}

// Animations
function update(){
    camControls.update( 1 );
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

// Camera object
function createCamera(){
        const fov = 100; //влияет на то, с какого расстояния подгрузится камера от сцены
        const aspect =  mainContainer.clientWidth / mainContainer.clientHeight; //ширина и высота элемента?
        const near = 0.1; // влияет на то, насколько близко мы можем приблизиться к сцены
        const far = 500; // влияет на то, насколько далеко мы можем отдалиться от сцены и все еще видеть ее
        camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

        // поставим камеру красиво
        camera.position.x = -20;
        camera.position.y = 130;
        camera.position.z = 100;
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
    const ambientLight = new THREE.AmbientLight( 0xffffff, 0.4 ); // 0x111111 - 0xaaaaaa, 1 ; 0xffffff, 0.1 - 0.3; 0x404040
    scene.add( ambientLight );
}

// Meshes and other visible objects
function createMeshes(){

        // делаем траву
        createPlane(200, 150, 0, 0, 0, -0.5, 0, 'images/grass3.jpg');
        // основная башня
        createRectangle(30, 66, 30, 0, 33, 0, 'images/bricks.jpg');
        // боковые пристройки
        createRectangle(70, 26, 4, -50, 13, 0, 'images/bricks.jpg');
        createRectangle(70, 26, 4, 50, 13, 0, 'images/bricks.jpg');
        // передняя пристройка
        createRectangle(18, 26, 16, 0, 13, 23, 'images/bricks.jpg');
        // пристройка сверху
        createRectangle(20, 16, 20, 0, 74, 0, 'images/bricks.jpg');
        // еще сверху
        createRectangle(10, 28, 10, 0, 84, 0, 'images/bricks.jpg');
        // пристраиваем конус
        createCone(4.5, 18, 12, 0, 106, 0, 0x00693A);
        // делаем звезду-шар
        createSphere(2, 3, 2, 0, 116, 0, 0xE40000);
        // делаем часики
        createPlane(10, 10, 0, 74, 10.1, 0, 0, 'images/Clock_cut.PNG');
        createPlane(10, 10, 0, 74, -10.1, 1, 0, 'images/Clock_cut.PNG');
        createPlane(10, 10, 10.1, 74, 0, 0, 0.5, 'images/Clock_cut.PNG');
        createPlane(10, 10, -10.1, 74, 0, 0, -0.5, 'images/Clock_cut.PNG');
        // делаем двери
        createPlane(10, 20, 0, 10, 31.1, 0, 0, 'images/doors.PNG');
        // делаем заборчики
           // правый
        for (let i = 18; i < 85; i+=5) {
                createRectangle(3, 4, 2, i, 28, 1, 'images/bricks.jpg');
        }
           // левый
        for (let i = -18; i > -85; i-=5) {
                createRectangle(3, 4, 2, i, 28, 1, 'images/bricks.jpg');
        }
           // передний спереди
        for (let i = -7.5; i < 11; i+=5) {
                createRectangle(3, 4, 2, i, 28, 30, 'images/bricks.jpg');
        }
           // боковые спереди
        for (let i = 26; i > 15; i-=5) {
                createRectangle(2, 4, 3, -8, 28, i, 'images/bricks.jpg');
        }

        for (let i = 26; i > 15; i-=5) {
                createRectangle(2, 4, 3, 8, 28, i, 'images/bricks.jpg');
        }

           // а теперь верхние 4 заборчика
        for (let i = -9.5; i < 10; i+=2) {
                createRectangle(1, 2, 1, i, 83, 9.5, 'images/wbricks.jpg');
        }

        for (let i = -9.5; i < 10; i+=2) {
                createRectangle(1, 2, 1, i, 83, -9.5, 'images/wbricks.jpg');
        }

        for (let i = -9.5; i < 10; i+=2.5) {
                createRectangle(1, 2, 1, -9.5, 83, i, 'images/wbricks.jpg');
        }

        for (let i = -9.5; i < 10; i+=2) {
                createRectangle(1, 2, 1, 9.5, 83, i, 'images/wbricks.jpg');
        }
        // добавим конусов
        createCone(2, 10, 4, -13, 71, 13, 0xF6F3F3);
        createCone(2, 10, 4, 13, 71, 13, 0xF6F3F3);
        createCone(2, 10, 4, 13, 71, -13, 0xF6F3F3);
        createCone(2, 10, 4, -13, 71, -13, 0xF6F3F3);

        
}

// Creating plane
function createPlane(plX, plY, corX, corY, corZ, angleX, angleY, texture){        
        const planeGeometry = new THREE.PlaneGeometry(plX, plY);
        const planeMaterial = new THREE.MeshLambertMaterial({
                map: loader.load(texture),
        });
        plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = angleX*Math.PI; //угол наклона плоскости меняется
        plane.rotation.y = angleY*Math.PI;
        plane.position.x = corX;
        plane.position.y = corY;
        plane.position.z = corZ;
        plane.receiveShadow = true;
        scene.add(plane);

}

//Создаем прямоугольники
function createRectangle (figX, figY, figZ, corX, corY, corZ, texture) {
        const boxGeometry = new THREE.BoxBufferGeometry(figX, figY, figZ);
        const boxMaterial = new THREE.MeshLambertMaterial({
                map: loader.load(texture),
        });
        box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.x=corX;
        box.position.y=corY;
        box.position.z=corZ;
        box.castShadow = true;
        box.receiveShadow = true;
        scene.add(box);
}

// Создаем конусы
function createCone(figRad, figHigh, figRadSeg, corX, corY, corZ, curcolor){        
        const coneGeometry = new THREE.ConeBufferGeometry( figRad, figHigh, figRadSeg );
        const coneMaterial =  new THREE.MeshLambertMaterial({color: curcolor, side:THREE.DoubleSide});
        cone = new THREE.Mesh( coneGeometry, coneMaterial );
        cone.position.x = corX;
        cone.position.y = corY;
        cone.position.z = corZ;
        cone.castShadow = true;
        scene.add(cone);   
}


// Create the sphere
function createSphere(figRad, figWidSeg, figHigSeg, corX, corY, corZ, curcolor){        
        const sphereGeometry = new THREE.SphereBufferGeometry(figRad,figWidSeg,figHigSeg);
        const sphereMaterial =  new THREE.MeshPhongMaterial({color: curcolor, flatShading:true});
        sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
        sphere.position.x = corX;
        sphere.position.y = corY;
        sphere.position.z = corZ;
        sphere.castShadow = true;
        scene.add(sphere);        
}



// Renderer object and features
function createRenderer(){
        // set antialiasing on to remove jagged edges
        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize(mainContainer.clientWidth, mainContainer.clientHeight);
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap | THREE.PCFShadowMap | THREE.PCFSoftShadowMap
        mainContainer.appendChild( renderer.domElement );
}

//что-то позволяющее добавлять элементы
window.addEventListener('resize', e => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
});

init();

 
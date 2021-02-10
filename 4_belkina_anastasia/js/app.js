// Import modules
import * as THREE from './mods/three.module.js'; // библиотека, используемая для создания и отображения 
                                                // анимированной компьютерной 3D графики при разработке веб-приложений.
import Stats from './mods/stats.module.js'; // вспомогательная библиотека, которая дает нам информацию о частоте кадров
import { OrbitControls } from './mods/OrbitControls.js'; // ну чтоб двигалась сцена
import { GUI } from './mods/dat.gui.module.js';
import { GLTFLoader } from './mods/GLTFLoader.js';
import { OBJLoader } from './mods/OBJLoader.js';
import { MTLLoader } from './mods/MTLLoader.js';

// Global letiables
let mainContainer = null;
let fpsContainer
let stats = null;
let camera = null;
let renderer = null;
let scene = null;
let camControls = null;

// Global Meshes
let sphere, cone, plane, box = null;

const wolf = new THREE.Group();
const mixers = []; // needed for animations
const clock = new THREE.Clock();
const moon = new THREE.Group();

let listener = null;
let sound = null;
let audioLoader = null;
let gui = null;

let controlBoxParams = {
        speed: true,
        soundon: true
};

const loader = new THREE.TextureLoader();

function init() {
        ///if ( THREE.WEBGL.isWebGLAvailable() === false ) container.appendChild( WEBGL.getWebGLErrorMessage() );
        fpsContainer = document.querySelector( '#fps' );
        mainContainer = document.querySelector( '#webgl-secne' ); // то, куда мы будем накидывать наши объекты
        scene = new THREE.Scene();
        //scene.background = new THREE.Color( 0x1F85DE );// http://www.colorpicker.com/  

        scene.background = new THREE.CubeTextureLoader()
	.setPath( 'img/cube2/' )
	.load( [
		'px.png',
		'nx.png',
		'py.png',
		'ny.png',
		'pz.png',
		'nz.png'
	] );  

        createStats();
        createCamera();
        createControls();
        createMeshes();
        createDirectionalLight();
        //createAmbientLight();
        createSound();
        createRenderer();
        renderer.setAnimationLoop( () => {
                update();
                render();
        } );

        const fogcolor = 0xffffff;  // white
        const fognear = 10;
        const fogfar = 100;
        const fogdensity = 0.005;
        //scene.fog = new THREE.Fog(fogcolor, fognear, fogfar);
        scene.fog = new THREE.FogExp2(fogcolor, fogdensity);

        // const loader2 = new THREE.TextureLoader();
        // const background2 = loader2.load('img/equirectangular_red_sq2.jpg', () => {
    	// const rt = new THREE.WebGLCubeRenderTarget(background2.image.height);
    	// rt.fromEquirectangularTexture(renderer, background2);
    	// scene.background = rt;
        // });  


}

// Animations
function update(){
        camControls.update( 1 );
        const delta = clock.getDelta();
        for (const mixer of mixers) {
                mixer.update(delta);
        }

        // if (typeof moon !== 'undefined') {
        //         moon.rotation.y -= controlBoxParams.speed
        // }

        if(controlBoxParams.speed == true) {
                moon.rotation.y -= 0.01
        }
        else {
                moon.rotation.y -= 0
        }

        if(controlBoxParams.soundon == true)sound.play();
        else sound.stop();

}

function createCtrlBox(){
        gui = new GUI();
        gui.remember(controlBoxParams);

        // let sc = gui.add( controlBoxParams, 'speed').min(0).max(0.1).step(0.01).name('Moon Speed');
        // sc.listen();

        let sc = gui.add( controlBoxParams, 'speed').name('Moon Movement On/Off');
        sc.listen();

        let sb = gui.add( controlBoxParams, 'soundon').name('Sound On/Off');
        sb.listen();
}

// Statically rendered content
function render(){
        stats.begin();
        renderer.render( scene, camera );
        stats.end();
}

function createSound(){
        listener = new THREE.AudioListener();
        camera.add( listener );
    
        // create a global audio source
        sound = new THREE.Audio( listener );
        // load a sound and set it as the Audio object's buffer
        audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'sounds/MedievalHalloweenMusic.mp3', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setLoop( true );
            sound.setVolume( 0.3 );
            //sound.play();
        });
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
        camera.position.x = 0;
        camera.position.y = 65;
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
    const ambientLight = new THREE.AmbientLight( 0xa3a3a3, 0.3 ); // 0x111111 - 0xaaaaaa, 1 ; 0xffffff, 0.1 - 0.3; 0x404040
    scene.add( ambientLight );
}

// Meshes and other visible objects
function createMeshes(){

        createCtrlBox();
        // делаем брусчатку
        createPlane(170, 148, 0, 0, 0, -0.5, 0, 'img/road2.jpg', 10, true);
        // основная башня
        createRectangle(30, 66, 30, 0, 33, 0, 'img/Black_brics.jpg', false);
        // боковые пристройки
        createRectangle(70, 26, 4, -50, 13, 0, 'img/Black_brics.jpg', false);
        createRectangle(70, 26, 4, 50, 13, 0, 'img/Black_brics.jpg', false);
        // передняя пристройка
        createRectangle(18, 26, 16, 0, 13, 23, 'img/Black_brics.jpg', false);
        // пристройка сверху
        createRectangle(20, 16, 20, 0, 74, 0, 'img/Black_brics.jpg', false);
        // еще сверху
        createRectangle(10, 28, 10, 0, 84, 0, 'img/Black_brics.jpg', false);
        // пристраиваем конус
        createCone(4.5, 18, 12, 0, 106, 0, 0x00693A);
        // делаем звезду-шар
        createSphere(2, 3, 2, 0, 116, 0, 0xE40000);
        // делаем часики
        createPlane(10, 10, 0, 74, 10.1, 0, 0, 'img/Clock_cut.PNG', 1, false);
        createPlane(10, 10, 0, 74, -10.1, 1, 0, 'img/Clock_cut.PNG', 1, false);
        createPlane(10, 10, 10.1, 74, 0, 0, 0.5, 'img/Clock_cut.PNG', 1, false);
        createPlane(10, 10, -10.1, 74, 0, 0, -0.5, 'img/Clock_cut.PNG', 1, false);
        // делаем дверь
        createPlane(10, 20, 0, 14, 31.1, 0, 0, 'img/doors.PNG', 1, false);
        // делаем заборчики
           // правый
        for (let i = 18; i < 85; i+=5) {
                createRectangle(3, 4, 2, i, 28, 1, 'img/Black_brics.jpg', false);
        }
           // левый
        for (let i = -18; i > -85; i-=5) {
                createRectangle(3, 4, 2, i, 28, 1, 'img/Black_brics.jpg', false);
        }
           // передний спереди
        for (let i = -7.5; i < 11; i+=5) {
                createRectangle(3, 4, 2, i, 28, 30, 'img/Black_brics.jpg', false);
        }
           // боковые спереди
        for (let i = 26; i > 15; i-=5) {
                createRectangle(2, 4, 3, -8, 28, i, 'img/Black_brics.jpg', false);
        }

        for (let i = 26; i > 15; i-=5) {
                createRectangle(2, 4, 3, 8, 28, i, 'img/Black_brics.jpg', false);
        }

           // а теперь верхние 4 заборчика
        for (let i = -9.5; i < 10; i+=2) {
                createRectangle(1, 2, 1, i, 83, 9.5, 'img/wbricks.jpg', false);
        }

        for (let i = -9.5; i < 10; i+=2) {
                createRectangle(1, 2, 1, i, 83, -9.5, 'img/wbricks.jpg', false);
        }

        for (let i = -9.5; i < 10; i+=2.5) {
                createRectangle(1, 2, 1, -9.5, 83, i, 'img/wbricks.jpg', false);
        }

        for (let i = -9.5; i < 10; i+=2) {
                createRectangle(1, 2, 1, 9.5, 83, i, 'img/wbricks.jpg', false);
        }
        // добавим конусов
        createCone(2, 10, 4, -13, 71, 13, 0xF6F3F3);
        createCone(2, 10, 4, 13, 71, 13, 0xF6F3F3);
        createCone(2, 10, 4, 13, 71, -13, 0xF6F3F3);
        createCone(2, 10, 4, -13, 71, -13, 0xF6F3F3);
        // добавим слова
        createWords();
        // добавим дорогу
        createRectangle(18, 4, 42, 0, 2, 52, 'img/road.jpg', true);
        // добавим приведений
        createBaloon(-20, 80, 20, "img/ghost1.png");
        createBaloon(30, 70, 30, "img/ghost2.png");
        createBaloon(-30, 50, 30, "img/ghost3.png");
        // добавим волков
        createWolf(-30, 2, 30, 4, 10);
        createWolf(30, 6, 30, 3, 20);
        // добавим луну
        createMoonObjMTL();
}

function createMoonObjMTL() {
        const mtlLoader = new MTLLoader();
        mtlLoader.load('models/moon/Moon.mtl', function(materials) {
            materials.preload();
            const objloader = new OBJLoader();
            objloader.setMaterials(materials);
            objloader.load('models/moon/Moon.obj', function(object) {
                object.traverse(function(child) {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.material.side = THREE.DoubleSide;
                        // child.geometry.computeFaceNormals();
                    }
                });
                object.position.set(50, 130, -30);
                object.scale.set(8, 8, 8);
                //object.translateZ(-5);
                moon.add(object);
            });
        });
        scene.add(moon);
}


function createWolf(x, y, z, type, duration) {
        const loader = new GLTFLoader();
        const onLoad = (gltf, position, scale) => {
                const model = gltf.scene.children[0];
                model.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                }
                });
                model.position.copy(position);
                model.scale.set(scale, scale, scale);
    
                const animation = gltf.animations[type];
                const mixer = new THREE.AnimationMixer(model);
                mixers.push(mixer);
                const action = mixer.clipAction(animation);
                action.setDuration(duration);
                action.play();
                wolf.add(model);
        };
        const onProgress = () => {};
        const onError = (errorMessage) => { console.log(errorMessage); };
    
        const modelPosition = new THREE.Vector3(x, y, z);
        const modelScale = 40.0;
        loader.load('./models/wolf/Wolf-Blender-2.82a.gltf', gltf => onLoad(gltf, modelPosition, modelScale), onProgress, onError); // glb
        wolf.rotation.y = 0*Math.PI;
        scene.add(wolf);
    }

// Creating plane
function createPlane(plX, plY, corX, corY, corZ, angleX, angleY, texture, set, bumping){        
        const planeGeometry = new THREE.PlaneGeometry(plX, plY);
        // const planeMaterial = new THREE.MeshLambertMaterial({
        //         map: loader.load(texture),
        // });

        const planeMaterial = new THREE.TextureLoader().load( texture);	// load texture
        
	// Set min max texture filters
	 planeMaterial.magFilter = THREE.NearestFilter;
	//planeMaterial.magFilter = THREE.LinearFilter;		// default mag filter
	//planeMaterial.minFilter = THREE.NearestFilter;
	// planeMaterial.minFilter = THREE.NearestMipMapNearestFilter;
	planeMaterial.minFilter = THREE.NearestMipMapLinearFilter;
	// planeMaterial.minFilter = THREE.LinearFilter;
	// planeMaterial.minFilter = THREE.LinearMipMapNearestFilter;
	//planeMaterial.minFilter = THREE.LinearMipMapLinearFilter;		// default min filter
	
	// set repeating params
	planeMaterial.wrapS = THREE.RepeatWrapping;
	planeMaterial.wrapT = THREE.RepeatWrapping;
	planeMaterial.repeat.set(set, set);
	// planeMaterial.repeat.set(0.5, 0.5); // zoom
        // planeMaterial.repeat.set(-2, -2); // repeat reversed

        const texture2 =  new THREE.MeshStandardMaterial({ map: planeMaterial });	// map texture to mesh
        plane = new THREE.Mesh(planeGeometry, texture2);
        
        if (bumping) {
        // Load bump map
	        const bump = new THREE.TextureLoader().load( "img/road_bump.jpg" ); // load bump map
	// You can repeat bump. Usually both bump and texture should have the same repeating params set.
	        bump.wrapS = THREE.RepeatWrapping;
	        bump.wrapT = THREE.RepeatWrapping;
                bump.repeat.set(set, set);
                texture2.bumpMap = bump;
                texture2.bumpScale = 0.8;
        }
        

        plane.rotation.x = angleX*Math.PI; //угол наклона плоскости меняется
        plane.rotation.y = angleY*Math.PI;
        plane.position.x = corX;
        plane.position.y = corY;
        plane.position.z = corZ;
        plane.receiveShadow = true;
        scene.add(plane);
}

//Создаем прямоугольники
function createRectangle (figX, figY, figZ, corX, corY, corZ, texture, bumping) {
        const boxGeometry = new THREE.BoxBufferGeometry(figX, figY, figZ);
        const boxMaterial = new THREE.MeshLambertMaterial({
                map: loader.load(texture),
        });
        box = new THREE.Mesh(boxGeometry, boxMaterial);
        if (bumping) {
        // Load bump map
                const bump = new THREE.TextureLoader().load( "img/road_bump.jpg" ); // load bump map
        // You can repeat bump. Usually both bump and texture should have the same repeating params set.
                // bump.wrapS = THREE.RepeatWrapping;
                // bump.wrapT = THREE.RepeatWrapping;
                boxMaterial.bumpMap = bump;
                boxMaterial.bumpScale = 0.8;
        }
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

function createWords(){
	const flagTexture = new THREE.TextureLoader().load( "img/Death.png" );
	const flagMaterial = new THREE.SpriteMaterial( { map: flagTexture, color: 0xffffff } );
	// const cloudMaterial = new THREE.SpriteMaterial( { map: cloudTexture, color: 0xffffff, transparent:true, opacity:0.7 } );
	const flag = new THREE.Sprite( flagMaterial );
	flag.scale.set(35, 45, 1);
	flag.position.set(40, 35, 30);
	scene.add( flag );
}

function createBaloon(bX, bY, bZ, texture) {
        const baloonTexture = new THREE.TextureLoader().load(texture);
	const baloonMaterial = new THREE.SpriteMaterial( { map: baloonTexture, color: 0xffffff } );
	// const cloudMaterial = new THREE.SpriteMaterial( { map: cloudTexture, color: 0xffffff, transparent:true, opacity:0.7 } );
	const baloon = new THREE.Sprite( baloonMaterial );
	baloon.scale.set(20, 20, 1);
	baloon.position.set(bX, bY, bZ);
	scene.add( baloon );
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

 
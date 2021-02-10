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

let listener = null;
let sound = null;
let audioLoader = null;

// Global Meshes
let sphere, cone, plane, box, cloud, vase, tree, star, snowy, snowfal = null;

let gui, ctrl = null;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let intersects;

const loader = new THREE.TextureLoader();

function init() {
        ///if ( THREE.WEBGL.isWebGLAvailable() === false ) container.appendChild( WEBGL.getWebGLErrorMessage() );
        fpsContainer = document.querySelector( '#fps' );
        //mainContainer = document.querySelector( '#webgl-secne' ); // то, куда мы будем накидывать наши объекты
        scene = new THREE.Scene();
        //scene.background = new THREE.Color( 0x1F85DE );// http://www.colorpicker.com/  

        scene.background = new THREE.CubeTextureLoader()
	.setPath( 'img/cube/' )
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
        if (controlBoxParams.crazytrip) {
        scene.traverse(function(e) {
                e.rotation.x += ctrl.rotationSpeed;
                e.rotation.y += ctrl.rotationSpeed;
                e.rotation.z += ctrl.rotationSpeed;
        });
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
        crazytrip: false
};

function createCtrlBox(){
        gui = new GUI();
        ctrl = new ObjectGenerator();
        gui.add(ctrl, 'numOfObjects').name("Number of snowflakes").listen();
        //gui.add(ctrl, 'showObjectsInfo').name("Show info");
        gui.add(ctrl, 'addObject').name("Add snowflake");
        gui.add(ctrl, 'removeLastObject').name("Remove snowflake");
        gui.add( controlBoxParams, 'crazytrip').name('Craziness On/Off');
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
 function createMeshes() {
        // делаем брусчатку
        createPlane(170, 148, 0, 0, 0, -0.5, 0, 'img/snow13.jpg', 10, false, true);
        // основная башня
        createRectangle(30, 66, 30, 0, 33, 0);
        // положим на нее снег
        createPlane(30, 30, 0, 66.2, 0, -0.5, 0, 'img/snow13.jpg', 10, false, false);

        // боковые пристройки
        createRectangle(4, 26, 70, -50, 13, 0);
        createRectangle(4, 26, 70, 50, 13, 0);
        // положим на них снег
        createPlane(70, 4, -50, 26.2, 0, -0.5, 0, 'img/snow13.jpg', 10, false, false);
        createPlane(70, 4, 50, 26.2, 0, -0.5, 0, 'img/snow13.jpg', 10, false, false);

        // передняя пристройка
        createRectangle(18, 26, 16, 0, 13, 23);
        // положим на нее снег
        createPlane(18, 16, 0, 26.2, 23, -0.5, 0, 'img/snow13.jpg', 10, false, false);

        // пристройка сверху
        createRectangle(20, 16, 20, 0, 74, 0);
        // положим на нее снег
        createPlane(20, 20, 0, 82.2, 0, -0.5, 0, 'img/snow13.jpg', 10, false, false);

        // еще сверху
        createRectangle(10, 28, 10, 0, 84, 0);
        // положим на нее снег
        createPlane(10, 10, 0, 98.2, 0, -0.5, 0, 'img/snow13.jpg', 10, false, false);

        // пристраиваем конус
        createCone(4.5, 18, 12, 0, 106, 0, 0x00693A);
        // делаем звезду-шар
        createSphere(2, 3, 2, 0, 116, 0, 0xE40000);
        // делаем часики
        createPlane(10, 10, 0, 74, 10.1, 0, 0, 'img/Clock_cut.PNG', 1, false, false);
        createPlane(10, 10, 0, 74, -10.1, 1, 0, 'img/Clock_cut.PNG', 1, false, false);
        createPlane(10, 10, 10.1, 74, 0, 0, 0.5, 'img/Clock_cut.PNG', 1, false, false);
        createPlane(10, 10, -10.1, 74, 0, 0, -0.5, 'img/Clock_cut.PNG', 1, false, false);
        // делаем дверь
        createPlane(10, 20, 0, 14, 32.3, 0, 0, 'img/doors.PNG', 1, false, false);
        // делаем заборчики
           // правый
           for (let i = 18; i < 85; i+=5) {
                createRectangle(3, 4, 2, i, 28, 1);
        }
           // левый
        for (let i = -18; i > -85; i-=5) {
                createRectangle(3, 4, 2, i, 28, 1);
        }
           // передний спереди
        for (let i = -7.5; i < 11; i+=5) {
                createRectangle(3, 4, 2, i, 28, 30);
        }
           // боковые спереди
        for (let i = 26; i > 15; i-=5) {
                createRectangle(2, 4, 3, -8, 28, i);
        }

        for (let i = 26; i > 15; i-=5) {
                createRectangle(2, 4, 3, 8, 28, i);
        }

           // а теперь верхние 4 заборчика
        for (let i = -9.5; i < 10; i+=2) {
                createRectangle(1, 2, 1, i, 83, 9.5);
        }

        for (let i = -9.5; i < 10; i+=2) {
                createRectangle(1, 2, 1, i, 83, -9.5);
        }

        for (let i = -9.5; i < 10; i+=2.5) {
                createRectangle(1, 2, 1, -9.5, 83, i);
        }

        for (let i = -9.5; i < 10; i+=2) {
                createRectangle(1, 2, 1, 9.5, 83, i);
        }
        // добавим конусов
        createCone(2, 10, 4, -13, 71, 13, 0xF6F3F3);
        createCone(2, 10, 4, 13, 71, 13, 0xF6F3F3);
        createCone(2, 10, 4, 13, 71, -13, 0xF6F3F3);
        createCone(2, 10, 4, -13, 71, -13, 0xF6F3F3);
        // делаем облачка со снегом
        createCloud(-20, 100, 10, "img/cloud.png");
        createCloud(30, 90, 15, "img/cloud.png");
        createCloud(-30, 80, 15, "img/cloud.png");

        // делаем елку
        createTree(0.5);
        // звезду на нее
        createStar(1);
        // и снеговик
        createSnowMan(6, 7);
        createSnowMan(4, 15);
        createSnowMan(2, 20);

        // vase = createVase(24, 50); // change to 24->4, 50->20
        // vase.translateX(10.0);
        // vase.translateY(10.0);
        // scene.add(vase);


}

function createVase(rotatePrec, heightPrec){
        const pts = [
        //     new THREE.Vector2( 2, 0),
        //     new THREE.Vector2( 3, 1),
        //     new THREE.Vector2( 4, 2),
        //     new THREE.Vector2( 3, 3),
        //     new THREE.Vector2( 2, 4),
        //     new THREE.Vector2( 1.5, 5),
        //     new THREE.Vector2( 2, 6)

        // new THREE.Vector2( 2, 0),
        // new THREE.Vector2( 2, 1),
        // new THREE.Vector2( 3, 3),
        // new THREE.Vector2( 2, 4),
        // new THREE.Vector2( 0, 4),

        new THREE.Vector2( 6, 0),
        new THREE.Vector2( 0, 5),
        new THREE.Vector2( 4, 7),
        new THREE.Vector2( 8, 10),
        new THREE.Vector2( 2, 10),
        new THREE.Vector2( 0, 16),
        ];
        
        const spline = new THREE.SplineCurve(pts);
        let splineGeometry = new THREE.Geometry();
        splineGeometry.vertices = spline.getPoints(heightPrec);
        
        const latheGeom = new THREE.LatheGeometry(splineGeometry.vertices, rotatePrec);
        //const latheGeom = new THREE.LatheGeometry(splineGeometry.vertices, rotatePrec, 0, Math.PI);
        
        const materials = [
            new THREE.MeshLambertMaterial( { opacity:0.6, color: 0xFF0000, transparent:true, side:THREE.DoubleSide} ),
            new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: false } )
        ];
        let mesh = SceneUtils.createMultiMaterialObject(latheGeom,materials);
        mesh.children.forEach(function(e) {
            e.castShadow=true;
            e.geometry.computeFaceNormals();
        });
    
        return mesh;
    }

function createSnowMan(rad, posY) {
        let points = [];
        for ( let i = 0; i < 7; i ++ ) {
            //points.push( new THREE.Vector2( Math.sin( i * form ) + 20,  i ) ); 
            points.push( new THREE.Vector2( rad*Math.sin(i), rad*Math.cos(i)) );
            //points.push( new THREE.Vector2(i*0.3, 10 - i));
        }
        // Rotate according y axis
        const latheGeom = new THREE.LatheGeometry( points );
    
        // Notice DoubleSide
        const materials = [
            new THREE.MeshLambertMaterial( { color: 0xffffff, side:THREE.DoubleSide } ),
            new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: false } )
        ];
    
        snowy = SceneUtils.createMultiMaterialObject(latheGeom,materials);
        snowy.children.forEach(function(e) {
            e.castShadow=true;
            e.receiveShadow = true;
            e.geometry.computeFaceNormals();
        }); 

        snowy.translateZ(50.0); // меняет позицию на сцене
        snowy.translateY(posY);
        snowy.translateX(-40.0);
        //snowy.rotateX = 1*Math.PI;
        scene.add(snowy);
}

function createStar(rad) {
        let points = [];
        for ( let i = 0; i < 6; i ++ ) {
            //points.push( new THREE.Vector2( Math.sin( i * form ) + 20,  i ) ); 
            //points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 10 + 5, ( i - 5 ) * 2 ) );
            points.push( new THREE.Vector2(rad*Math.sin(i*0.7), i));
        }
        // Rotate according y axis
        const latheGeom = new THREE.LatheGeometry( points );
    
        // Notice DoubleSide
        const materials = [
            new THREE.MeshLambertMaterial( { opacity:0.8, color: 0xff0000, transparent:true, side:THREE.DoubleSide } ),
            new THREE.MeshBasicMaterial( { color: 0x000000 } )
        ];
    
        star = SceneUtils.createMultiMaterialObject(latheGeom,materials);
        star.children.forEach(function(e) {
            e.castShadow=true;
            e.receiveShadow = true;
            e.geometry.computeFaceNormals();
        }); 
        
        star.translateZ(50.0);
        star.translateY(39.0);
        star.translateX(40.0);
        //star.rotateZ = 1*Math.PI;
        scene.add(star);
}

function createTree(form) {
        let points = [];
        for ( let i = 0; i < 40; i ++ ) {
            //points.push( new THREE.Vector2( Math.sin( i * form ) + 20,  i ) ); 
            //points.push( new THREE.Vector2( Math.sin( i * 0.2 ) * 10 + 5, ( i - 5 ) * 2 ) );
            points.push( new THREE.Vector2(i*0.3, 10 - i));
        }
        // Rotate according y axis
        const latheGeom = new THREE.LatheGeometry( points );
    
        // Notice DoubleSide
        const materials = [
            new THREE.MeshLambertMaterial( { opacity:0.8, color: 0x008000, transparent:true, side:THREE.DoubleSide } ),
            new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: true } )
        ];
    
        tree = SceneUtils.createMultiMaterialObject(latheGeom,materials);
        tree.children.forEach(function(e) {
            e.castShadow=true;
            e.receiveShadow = true;
            e.geometry.computeFaceNormals();
        }); 

        tree.translateZ(50.0); // меняет позицию на сцене
        tree.translateY(30.0);
        tree.translateX(40.0);
        //tree.rotateX = 1*Math.PI;
        scene.add(tree);
}

class ObjectGenerator{
        numOfObjects = scene.children.length - 110;
        rotationSpeed = 0.02;
        
        constructor(){}
        
        showObjectsInfo(){
            this.numOfObjects = scene.children.length - 110;
            console.log(scene.children - 110);
        }
        
        addObject(){
            const objectSize = Math.ceil((Math.random() * 2));
            const box = createSnow(objectSize); 
    
            box.name = "box-" + scene.children.length;
    
            box.position.x= -20 + Math.round((Math.random() * 100));
            box.position.y= Math.round((Math.random() * 40));
            box.position.z= -17.5 + Math.round((Math.random() * 100));
            scene.add(box);
    
            this.numOfObjects = scene.children.length - 110;
        }
        
        removeLastObject() {
            const allChildren = scene.children;
            const lastObject = allChildren[allChildren.length-1];
            if (lastObject instanceof THREE.Mesh) {
                scene.remove(lastObject);
            }
            this.numOfObjects = scene.children.length - 110;
        }
}

function createSnow(objectSize){        
        const sphereGeometry = new THREE.SphereBufferGeometry(objectSize, 3, 2);
        const sphereMaterial =  new THREE.MeshLambertMaterial({color: 0xb3f0ff, opacity:0.8, transparent:true});
        snowfal = new THREE.Mesh(sphereGeometry,sphereMaterial);
        snowfal.castShadow = true;
        return snowfal;        
}

function createPlane(plX, plY, corX, corY, corZ, angleX, angleY, texture, set, bumping, hills){
        //const planeGeometry = new THREE.PlaneBufferGeometry(40,40);
        let planeGeometry = new THREE.PlaneGeometry(plX, plY, 20, 20);

        if (hills) {
                for ( let i = 0, l = planeGeometry.vertices.length; i < l; i ++ ) {
                        planeGeometry.vertices[i].z = Math.random() * 3;
                }   
        }
        
        //const planeMaterial =  new THREE.MeshStandardMaterial({color: 0xcccccc});
        const planeMaterial = new THREE.TextureLoader().load(texture);	// load texture
        planeMaterial.magFilter = THREE.NearestFilter;
        planeMaterial.minFilter = THREE.NearestMipMapLinearFilter;
        // set repeating params
	planeMaterial.wrapS = THREE.RepeatWrapping;
	planeMaterial.wrapT = THREE.RepeatWrapping;
        planeMaterial.repeat.set(set, set);
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
        // plane = new THREE.Mesh(planeGeometry,planeMaterial);
        plane.rotation.x = angleX*Math.PI;
        plane.rotation.y = angleY*Math.PI;
        plane.position.x = corX;
        plane.position.y = corY;
        plane.position.z = corZ;
        plane.receiveShadow = true;
        scene.add(plane);
}

function createCloud(bX, bY, bZ, texture) {
        const cloudTexture = new THREE.TextureLoader().load(texture);
	const cloudMaterial = new THREE.SpriteMaterial( { map: cloudTexture, color: 0xffffff } );
	// const cloudMaterial = new THREE.SpriteMaterial( { map: cloudTexture, color: 0xffffff, transparent:true, opacity:0.7 } );
	const cloud = new THREE.Sprite( cloudMaterial );
	cloud.scale.set(50, 50, 1);
	cloud.position.set(bX, bY, bZ);
	scene.add( cloud );
}

//Создаем прямоугольники
function createRectangle (figX, figY, figZ, corX, corY, corZ) {
        // const boxGeometry = new THREE.BoxBufferGeometry(figX, figY, figZ);
        // const boxMaterial = new THREE.MeshLambertMaterial({
        //         map: loader.load(texture),
        // });
        // box = new THREE.Mesh(boxGeometry, boxMaterial);

        let l = figZ/2;
        let w = figX/2;
        let h = figY/2;
        const vertices = [
                new THREE.Vector3( l,  h,  w),
                new THREE.Vector3( l,  h, -w),
                new THREE.Vector3( l, -h,  w),
                new THREE.Vector3( l, -h, -w),
                new THREE.Vector3(-l,  h, -w),
                new THREE.Vector3(-l,  h,  w),
                new THREE.Vector3(-l, -h, -w),
                new THREE.Vector3(-l, -h,  w)
            ];
        const faces = [
                new THREE.Face3(0,2,1),
                new THREE.Face3(2,3,1),
                new THREE.Face3(4,6,5),
                new THREE.Face3(6,7,5),
                new THREE.Face3(4,5,1),
                new THREE.Face3(5,0,1),
                new THREE.Face3(7,6,2),
                new THREE.Face3(6,3,2),
                new THREE.Face3(5,7,0),
                new THREE.Face3(7,2,0),
                new THREE.Face3(1,3,4),
                new THREE.Face3(3,6,4)
            ];
        let geom = new THREE.Geometry();
        geom.vertices = vertices;
        geom.faces = faces;
        for (let i = 0; i < geom.faces.length; i++) {
                let face = geom.faces[i];
                face.color.setHex(Math.random() * 0xffffff);
        }
        const bmaterial =  new THREE.MeshBasicMaterial({opacity:0.7, vertexColors: THREE.FaceColors, transparent:true});
        box = new THREE.Mesh(geom,bmaterial);
        box.castShadow = true;
        box.receiveShadow = true;
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
        const coneMaterial =  new THREE.MeshLambertMaterial({opacity:0.7, color: curcolor, side:THREE.DoubleSide, transparent:true});
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

mainContainer.addEventListener('mousemove', e => {
        mouse.x = 2 * ( e.clientX / window.innerWidth ) - 1;
        mouse.y = 1 - 2 * ( e.clientY / window.innerHeight );
});

mainContainer.addEventListener('mousedown', e => {
        e.preventDefault();
        raycaster.setFromCamera( mouse, camera );
        intersects = raycaster.intersectObjects( scene.children, true ); // true mean recursively, if false checks only object
        for ( var i = 0; i < intersects.length; i++ ) {
                if(intersects[ i ].object != plane){
                        createSound();
                        console.log("Clicked to play sound");
                }  
        }
});

function createSound(){
        listener = new THREE.AudioListener();
        camera.add( listener );
        // create a global audio source
        sound = new THREE.Audio( listener );
        // load a sound and set it as the Audio object's buffer
        audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'sounds/hohoho.mp3', function( buffer ) {
            sound.setBuffer( buffer );
            sound.setLoop( false );
            sound.setVolume( 0.3 );
            sound.play();
        });
}

//что-то позволяющее добавлять элементы
window.addEventListener('resize', e => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
});

init();

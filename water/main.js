var renderer, labelRenderer;
function initRender() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    //告诉渲染器需要阴影效果
    renderer.setClearColor(0x000000);
    document.body.appendChild(renderer.domElement);

    //实例化css2dRenderer
    labelRenderer = new THREE.CSS2DRenderer();
    labelRenderer.setSize(window.innerWidth, window.innerHeight);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(labelRenderer.domElement);
}

var camera;
function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 40, 50);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.name = 'camera'
}

var scene;
function initScene() {
    scene = new THREE.Scene();
}

//初始化dat.GUI简化试验流程
var gui;
function initGui() {
    //声明一个保存需求修改的相关数据的对象
    gui = {
    };
    var datGui = new dat.GUI();
    //将设置属性添加到gui当中，gui.add(对象，属性，最小值，最大值）
}

var light;
function initLight() {
    var alight = new THREE.AmbientLight(0x444444);
    alight.name = 'alight'
    scene.add(alight);

    light = new THREE.DirectionalLight(0xffffff);
    light.name = 'light'
    light.position.set(200, 200, 100);

    //告诉平行光需要开启阴影投射
    light.castShadow = true;

    scene.add(light);
}

function initHelper() {
    //辅助工具
    var helper = new THREE.AxesHelper(50);
    scene.add(helper);
}

var root;
function initModel(name) {

    var loader = new THREE.PDBLoader();
    loader.load("../models/" + name, function (pdb) {
        //创建一个模型组
        root = new THREE.Group();
        var offset = new THREE.Vector3();

        //获取到原子相关的数据
        var geometryAtoms = pdb.geometryAtoms;
        //获取到原子间的键的数据
        var geometryBonds = pdb.geometryBonds;
        //获取原子文字的数据
        var json = pdb.json;

        var boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1);
        var sphereGeometry = new THREE.IcosahedronBufferGeometry(1, 2);

        //让模型居中
        geometryAtoms.computeBoundingBox();
        geometryAtoms.boundingBox.getCenter(offset).negate();
        geometryAtoms.translate(offset.x, offset.y, offset.z);
        geometryBonds.translate(offset.x, offset.y, offset.z);

        //将原子和原子的文字添加到模型组当中
        var positions = geometryAtoms.getAttribute('position');
        var colors = geometryAtoms.getAttribute('color');
        var position = new THREE.Vector3();
        var color = new THREE.Color();
        for (var i = 0; i < positions.count; i++) {
            position.x = positions.getX(i);
            position.y = positions.getY(i);
            position.z = positions.getZ(i);
            color.r = colors.getX(i);
            color.g = colors.getY(i);
            color.b = colors.getZ(i);
            var material = new THREE.MeshPhongMaterial({ color: color });
            var object = new THREE.Mesh(sphereGeometry, material);
            object.position.copy(position);
            object.position.multiplyScalar(75);
            object.scale.multiplyScalar(25);
            root.add(object);
            var atom = json.atoms[i];
            var text = document.createElement('div');
            text.className = 'label';
            text.style.color = 'rgb(' + atom[3][0] + ',' + atom[3][1] + ',' + atom[3][2] + ')';
            text.style.textShadow = "1px 1px 1px #000";
            text.textContent = atom[4];
            var label = new THREE.CSS2DObject(text);
            label.position.copy(object.position);
            root.add(label);
        }

        //将原子之间的键添加到模型组当中
        positions = geometryBonds.getAttribute('position');
        var start = new THREE.Vector3();
        var end = new THREE.Vector3();
        for (var i = 0; i < positions.count; i += 2) {
            start.x = positions.getX(i);
            start.y = positions.getY(i);
            start.z = positions.getZ(i);
            end.x = positions.getX(i + 1);
            end.y = positions.getY(i + 1);
            end.z = positions.getZ(i + 1);
            start.multiplyScalar(75);
            end.multiplyScalar(75);
            var object = new THREE.Mesh(boxGeometry, new THREE.MeshPhongMaterial(0xffffff));
            object.position.copy(start);
            object.position.lerp(end, 0.5);
            object.scale.set(5, 5, start.distanceTo(end));
            object.lookAt(end);
            root.add(object);
        }

        //缩放并将模型组添加到场景当中
        root.scale.set(0.1, 0.1, 0.1);
        scene.add(root);
    });
}


//用户交互插件 鼠标左键按住旋转，右键按住平移，滚轮缩放
var controls;
function initControls(control) {

    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // 如果使用animate方法时，将此函数删除
    //controls.addEventListener( 'change', render );
    // 使动画循环使用时阻尼或自转 意思是否有惯性
    controls.enableDamping = true;
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    //controls.dampingFactor = 0.25;
    //是否可以旋转
    controls.enableRotate = control;
    //是否可以缩放
    controls.enableZoom = control;
    //是否自动旋转
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    //设置相机距离原点的最远距离
    controls.minDistance = 1;
    //设置相机距离原点的最远距离
    controls.maxDistance = 200;
    //是否开启右键拖拽
    controls.enablePan = control;
}

function render() {

    renderer.render(scene, camera);

    labelRenderer.render(scene, camera);
}

//窗口变动触发的函数
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    render();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    //更新控制器
    render();

    controls.update();

    requestAnimationFrame(animate);
}

function set_operate(control = true) {
    initControls(control);
    var div2 = document.createElement('div');
    div2.classList.add('float', 'text');
    document.body.appendChild(div2);
    if (control) {
        /*
        <div class="float btn" onclick="switch_model()">点我切换模型</div>
        <div class="float text"></div>
        */
        var div1 = document.createElement('div');
        div1.classList.add('float', 'btn');
        div1.onclick = switch_model;
        div1.innerText = '点我切换模型';
        document.body.appendChild(div1);

    }
}

var lists = ['h.pdb', 'o.pdb', 'hf.pdb', 'of.pdb', 'water.pdb'];
var modelid = -1;
var names = ['氢分子(H)', '氧分子(O)', '氢分子(H<sub>2</sub>)', '氧分子(O<sub>2</sub>)', '水分子(H<sub>2</sub>O)'];
function set_model(modelid) {
    let i = 0;
    scene.remove(root);
    for (var el of document.querySelectorAll('.label')) {
        el.parentNode.removeChild(el);
    }
    initModel(lists[modelid]);
    document.querySelector('.text').innerHTML = names[modelid];
}
function switch_model() {
    modelid = (modelid + 1) % lists.length;
    set_model(modelid);
}
function draw(control = true, id = 0) {
    //兼容性判断
    if (!Detector.webgl) Detector.addGetWebGLMessage();
    initGui();
    initRender();
    initScene();
    initCamera();
    initLight();
    initHelper();
    window.onresize = onWindowResize;
    set_operate(control);
    if (control) {
        switch_model();
    } else {
        set_model(id);
    }
    animate();
}
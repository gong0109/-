// 添加在 script.js 的开头部分
particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 200,
            "density": {
                "enable": true,
                "value_area": 600
            }
        },
        "color": {
            "value": "#ffffff"
        },
        "shape": {
            "type": "circle"
        },
        "opacity": {
            "value": 0.5,
            "random": false
        },
        "size": {
            "value": 2,
            "random": true
        },
        "line_linked": {
            "enable": false
        },
        "move": {
            "enable": true,
            "speed": 1.0,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "repulse"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            },
            "resize": true
        },
        "modes": {
            "repulse": {
                "distance": 300,
                "duration": 0.4,
                "speed": 3,
                "factor": 200,
                "easing": "ease-out"
            }
        }
    },
    "retina_detect": true
});

// 页面加载完成后执行
window.addEventListener('load', function() {
    setTimeout(function() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 1.5s ease-out';
        
        setTimeout(function() {
            loadingScreen.style.display = 'none';
        }, 1000); // 将时间从原来的1000ms改为5000ms (5秒)
    }, 2000); // 将时间从原来的2000ms改为4000ms (4秒)
});

let scene, camera, renderer, controls;
let currentModel = null;
let currentModelIndex = 0;
let isRotating = true;
const modelPaths = [
    './models/3D1.glb',
    './models/3D2.glb',
    './models/3D3.glb',
    './models/3D4.glb'
];

function init() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(
        50, 
        document.getElementById('model-container').offsetWidth / 
        document.getElementById('model-container').offsetHeight,
        0.1,
        1000
    );
    
    camera.position.z = 10;
    camera.position.y = 0;
    camera.position.x = 0;
    
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        precision: "highp"
    });
    
    renderer.setSize(
        document.getElementById('model-container').offsetWidth, 
        document.getElementById('model-container').offsetHeight
    );
    
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.gammaFactor = 2.2;
    
    document.getElementById('model-container').appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.8;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controls.enablePan = false;
    
    controls.addEventListener('start', function() {
        isRotating = false;
    });
    
    controls.addEventListener('end', function() {
        setTimeout(() => {
            isRotating = true;
        }, 3000);
    });

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(5, 10, 7.5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(-5, -5, -5);
    scene.add(backLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    pointLight.position.set(0, 5, 5);
    scene.add(pointLight);

    showModel(currentModelIndex);
    animate();

    window.addEventListener('resize', onWindowResize, false);
}

function showModel(index) {
    const loader = new THREE.GLTFLoader();
    
    if (currentModel) {
        scene.remove(currentModel);
    }

    loader.load(
        modelPaths[index], 
        function(gltf) {
            currentModel = gltf.scene;
            
            currentModel.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                    if (node.material) {
                        node.material.envMapIntensity = 1.5;
                        node.material.needsUpdate = true;
                        node.material.metalness = 0.8;
                        node.material.roughness = 0.2;
                    }
                }
            });
            
            const box = new THREE.Box3().setFromObject(currentModel);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            const maxSize = Math.max(size.x, size.y, size.z);
            const scale = 5 / maxSize;
            currentModel.scale.set(scale, scale, scale);
            
            currentModel.position.x = -center.x * scale;
            currentModel.position.y = -center.y * scale;
            currentModel.position.z = -center.z * scale;

            scene.add(currentModel);
            updateNavigationButtons();
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% 已加载');
        },
        function(error) {
            console.error('模型加载出错:', error);
            console.log('请检查模型文件路径是否正确');
        }
    );
}

function previousModel() {
    if (currentModelIndex > 0) {
        currentModelIndex--;
        showModel(currentModelIndex);
    }
}

function nextModel() {
    if (currentModelIndex < modelPaths.length - 1) {
        currentModelIndex++;
        showModel(currentModelIndex);
    }
}

function updateNavigationButtons() {
    const prevButton = document.querySelector('.nav-button.prev');
    const nextButton = document.querySelector('.nav-button.next');
    
    prevButton.disabled = currentModelIndex === 0;
    nextButton.disabled = currentModelIndex === modelPaths.length - 1;
}

function onWindowResize() {
    camera.aspect = document.getElementById('model-container').offsetWidth / 
                    document.getElementById('model-container').offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
        document.getElementById('model-container').offsetWidth, 
        document.getElementById('model-container').offsetHeight
    );
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

init();

// 添加模块切换函数
function switchModule(moduleName) {
    document.getElementById('module1').style.display = 'none';
    document.getElementById('module2').style.display = 'none';
    document.getElementById('module3').style.display = 'none';
    document.getElementById(moduleName).style.display = 'block';
}

function switchModule(moduleName) {
    document.getElementById('module1').style.display = 'none';
    document.getElementById('module2').style.display = 'none';
    document.getElementById('module3').style.display = 'none';
    document.getElementById(moduleName).style.display = 'block';
}

function switchLoginType(type) {
    // 更新按钮状态
    const buttons = document.querySelectorAll('.switch-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // 切换显示内容
    document.getElementById('password-login').style.display = type === 'password' ? 'flex' : 'none';
    document.getElementById('qr-login').style.display = type === 'qr' ? 'flex' : 'none';
}

// 显示支付二维码
function showPaymentQR() {
    document.getElementById('paymentModal').style.display = 'flex';
}

// 关闭支付二维码
function closePaymentModal() {
    document.getElementById('paymentModal').style.display = 'none';
}

// 修改购买按钮的点击事件
function buyNow() {
    showPaymentQR();
}

function handleLogin(event) {
    event.preventDefault(); // 阻止表单默认提交
    
    // 获取输入的用户名和密码
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 简单的验证逻辑（实际应用中应该连接到后端进行验证）
    if (username === "admin" && password === "123456") {
        // 显示登录成功提示
        document.getElementById('login-success').style.display = 'flex';
        
        // 2秒后自动返回主页面
        setTimeout(() => {
            document.getElementById('login-success').style.display = 'none';
            switchModule('module1');
        }, 2000);
    } else {
        alert("用户名或密码错误！");
    }
}

// 初始化粒子效果
document.addEventListener("DOMContentLoaded", function() {
    particlesJS.load('particles-js', 'particles.json', function() {
        console.log('particles.js loaded');
    });
});
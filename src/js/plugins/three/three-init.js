import * as THREE from 'three';
import createCube from './three-cube';

const wireCamToDeviceOrient = (camera, scene) => {
  console.log('orientation started');
  DeviceOrientationEvent.requestPermission()
  .then(response => {
    if (response == 'granted') {
      console.log('orientation permitted');

      let firstOrientation;
      let lastAngle = 0;

      window.addEventListener("deviceorientation", (event) => {
        // console.table([event.gamma,event.beta,event.gamma]);
        const sensitivity = 0.006;
        
        if (!firstOrientation) {
          firstOrientation = {
            gamma: event.gamma,
            alpha: event.alpha,
            beta: event.beta
          };
          lastAngle = event.alpha;
        }
        document.querySelector('.orient-alpha').innerText = lastAngle - event.alpha;
        document.querySelector('.orient-beta').innerText = (firstOrientation.beta - event.beta)*sensitivity;
        document.querySelector('.orient-gamma').innerText = (firstOrientation.gamma - event.gamma)*sensitivity;
        camera.position.x = (firstOrientation.gamma - event.gamma)*sensitivity;
        camera.position.y = -(firstOrientation.beta - event.beta)*sensitivity;

        let angle = lastAngle - event.alpha;
        let quaternion = new THREE.Quaternion;
        let z_axis = new THREE.Vector3( 0, 0, 1 );
        // camera.up.applyQuaternion(quaternion.setFromAxisAngle(z_axis, angle*sensitivity));
        lastAngle = event.alpha;

        if (scene.getObjectByName('cube')) {
          // console.log('camera recentering')
          camera.lookAt(scene.getObjectByName('cube').position);
        }
      });
    }
  })
  .catch(console.error)

  
};

const initScene = threeEl => {
  const camera = new THREE.PerspectiveCamera(
    70,
    threeEl.offsetWidth / threeEl.offsetHeight,
    0.01,
    10
  );

  camera.position.z = 1;
  
  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(threeEl.offsetWidth, threeEl.offsetHeight);
  threeEl.appendChild(renderer.domElement);

  const onWindowResize = () => {
    camera.aspect = threeEl.offsetWidth / threeEl.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(threeEl.offsetWidth, threeEl.offsetHeight);
  };

  window.addEventListener('resize', onWindowResize, false);
  
  const startBtn = document.querySelector('.start');
  startBtn.addEventListener("click", (event) => {
    event.currentTarget.classList.add('hidden');
    wireCamToDeviceOrient(camera, scene);
  });
  
  scene.animationQueue = [];
  const animate = () => {
    requestAnimationFrame(animate);
    scene.animationQueue.forEach(animation => {
      animation(scene);
    });

    renderer.render(scene, camera);
  };
  animate();

  return {
    scene,
    camera,
    renderer
  };
};

const initThree = threeEl => {
  const { scene } = initScene(threeEl);
  createCube(scene);
};

export default initThree;

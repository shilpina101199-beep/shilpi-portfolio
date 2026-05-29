import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three-stdlib";

const WhatIDoModel = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 100);
    const loader = new GLTFLoader();
    const pointer = new THREE.Vector2();
    let model: THREE.Object3D | null = null;
    let eyeLookTargets: THREE.Object3D[] = [];
    let eyeBlinkTargets: THREE.Object3D[] = [];
    const blink = { next: 1.2, start: -1, duration: 0.16 };
    let frameId = 0;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    camera.position.set(0, 0.25, 8);
    scene.add(new THREE.AmbientLight(0xffffff, 1.35));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xd8b8ff, 3);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    loader.load("/models/what-i-do-avatar.glb", (gltf) => {
      model = gltf.scene;
      model.name = "WhatIDoLaptopAvatar";

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = size.y > 0 ? 2.85 / size.y : 1;

      model.position.sub(center);
      model.scale.setScalar(scale);
      model.position.set(0.1, -0.2, 0);
      model.rotation.set(-0.04, -0.26, 0);
      const eyes = createLaptopAvatarEyes(size);
      eyeLookTargets = eyes.userData.lookTargets as THREE.Object3D[];
      eyeBlinkTargets = eyes.userData.blinkTargets as THREE.Object3D[];
      model.add(eyes);

      model.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          mesh.frustumCulled = true;
        }
      });

      scene.add(model);
    });

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (model) {
        model.rotation.y += (pointer.x * 0.18 - model.rotation.y) * 0.035;
        model.rotation.x += (-pointer.y * 0.06 - model.rotation.x) * 0.025;
        updateEyeLook(eyeLookTargets, pointer.x, pointer.y);
        updateBlinkingEyes(eyeBlinkTargets, performance.now() / 1000, blink);
      }
      renderer.render(scene, camera);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="what-model" ref={containerRef} aria-hidden="true" />;
};

export default WhatIDoModel;

function createLaptopAvatarEyes(_size: THREE.Vector3) {
  const eyes = new THREE.Group();
  eyes.name = "WhatIDoEyes";
  eyes.userData.lookTargets = [];
  eyes.userData.blinkTargets = [];

  const scleraMaterial = new THREE.MeshStandardMaterial({
    color: "#f4f0ec",
    roughness: 0.5,
    metalness: 0,
  });
  const irisMaterial = new THREE.MeshStandardMaterial({
    color: "#6b3f1f",
    roughness: 0.42,
    metalness: 0,
  });
  const pupilMaterial = new THREE.MeshStandardMaterial({
    color: "#07060b",
    roughness: 0.22,
    metalness: 0,
  });
  const highlightMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff" });

  const createEye = (name: string, position: THREE.Vector3) => {
    const eye = new THREE.Group();
    eye.name = name;
    eye.position.copy(position);
    eye.rotation.set(-0.06, -0.04, 0);
    eye.scale.set(0.034, 0.016, 0.004);
    eye.userData.baseScaleY = eye.scale.y;
    eye.userData.basePosition = eye.position.clone();

    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 16),
      scleraMaterial
    );
    eye.add(sclera);

    const iris = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 16),
      irisMaterial
    );
    iris.position.set(0, -0.01, 0.9);
    iris.scale.set(0.5, 0.72, 0.08);
    eye.add(iris);

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 12),
      pupilMaterial
    );
    pupil.position.set(0, -0.01, 0.98);
    pupil.scale.set(0.22, 0.32, 0.04);
    eye.add(pupil);

    const catchlight = new THREE.Mesh(
      new THREE.SphereGeometry(1, 12, 8),
      highlightMaterial
    );
    catchlight.position.set(-0.16, 0.22, 1.02);
    catchlight.scale.set(0.07, 0.09, 0.02);
    eye.add(catchlight);

    eyes.userData.lookTargets.push(eye);
    eyes.userData.blinkTargets.push(eye);
    return eye;
  };

  eyes.add(createEye("WhatIDoLeftEye", new THREE.Vector3(0.29, 0.34, -0.56)));
  eyes.add(createEye("WhatIDoRightEye", new THREE.Vector3(0.42, 0.33, -0.55)));

  return eyes;
}

function updateEyeLook(eyes: THREE.Object3D[], mouseX: number, mouseY: number) {
  eyes.forEach((eye) => {
    const basePosition = eye.userData.basePosition as THREE.Vector3 | undefined;
    if (!basePosition) return;

    eye.position.x = THREE.MathUtils.lerp(
      eye.position.x,
      basePosition.x + mouseX * 0.004,
      0.12
    );
    eye.position.y = THREE.MathUtils.lerp(
      eye.position.y,
      basePosition.y + mouseY * 0.003,
      0.12
    );
  });
}

function updateBlinkingEyes(
  eyes: THREE.Object3D[],
  elapsedTime: number,
  blink: { next: number; start: number; duration: number }
) {
  if (!eyes.length) return;

  if (blink.start < 0 && elapsedTime >= blink.next) {
    blink.start = elapsedTime;
  }

  if (blink.start >= 0) {
    const progress = Math.min((elapsedTime - blink.start) / blink.duration, 1);
    const closeAmount = Math.sin(progress * Math.PI);

    eyes.forEach((eye) => {
      const baseScaleY =
        typeof eye.userData.baseScaleY === "number"
          ? eye.userData.baseScaleY
          : eye.scale.y;
      eye.scale.y = baseScaleY * THREE.MathUtils.lerp(1, 0.08, closeAmount);
    });

    if (progress >= 1) {
      eyes.forEach((eye) => {
        if (typeof eye.userData.baseScaleY === "number") {
          eye.scale.y = eye.userData.baseScaleY;
        }
      });
      blink.start = -1;
      blink.next = elapsedTime + 2.2 + Math.random() * 2.8;
    }
  }
}

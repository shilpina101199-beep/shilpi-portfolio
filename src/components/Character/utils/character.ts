import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        let character: THREE.Object3D;
        loader.load(
          "/models/shilpi-avatar.glb",
          async (gltf) => {
            character = prepareCustomAvatar(gltf.scene);
            gltf.scene = character;
            await renderer.compileAsync(character, camera, scene);
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                child.castShadow = true;
                child.receiveShadow = true;
                mesh.frustumCulled = true;
              }
            });
            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();
            character.getObjectByName("footR")?.position.setY(3.36);
            character.getObjectByName("footL")?.position.setY(3.36);
            dracoLoader.dispose();
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;

function prepareCustomAvatar(importedScene: THREE.Object3D) {
  const root = new THREE.Group();
  const head = new THREE.Group();

  root.name = "ShilpiAvatarRoot";
  head.name = "Head";
  root.userData.headTarget = head;

  importedScene.name = "Body";
  importedScene.traverse((object) => {
    if (!object.name && (object as THREE.Mesh).isMesh) object.name = "Body";
  });

  const box = new THREE.Box3().setFromObject(importedScene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const neckY = box.min.y + size.y * 0.28;

  importedScene.position.x -= center.x;
  importedScene.position.y -= neckY;
  importedScene.position.z -= center.z;

  const targetHeight = 3.6;
  const scale = size.y > 0 ? targetHeight / size.y : 1;
  root.scale.setScalar(scale);
  root.position.y = 10.8;

  head.add(importedScene);
  head.add(createBlinkingEyes(size));
  root.add(createTShirtBust(size));
  root.add(head);

  return root;
}

function createBlinkingEyes(size: THREE.Vector3) {
  const eyes = new THREE.Group();
  eyes.name = "Eyes";
  eyes.userData.blinkTargets = [];
  eyes.userData.lookTargets = [];

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
  const eyelidMaterial = new THREE.MeshStandardMaterial({
    color: "#f0ece8",
    roughness: 0.58,
    metalness: 0,
  });
  const highlightMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff" });

  const eyeX = size.x * 0.132;
  const eyeY = size.y * 0.288;
  const eyeZ = Math.max(size.z * 0.39, size.y * 0.11);

  const createEye = (name: string, x: number) => {
    const eye = new THREE.Group();
    eye.name = name;
    eye.position.set(x, eyeY, eyeZ);
    eye.rotation.x = -0.04;
    eye.scale.set(size.x * 0.052, size.y * 0.026, size.x * 0.008);
    eye.userData.baseScaleY = eye.scale.y;
    eye.userData.basePosition = eye.position.clone();

    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 16),
      scleraMaterial
    );
    sclera.name = `${name}Sclera`;
    eye.add(sclera);

    const iris = new THREE.Mesh(
      new THREE.SphereGeometry(1, 32, 16),
      irisMaterial
    );
    iris.name = `${name}Iris`;
    iris.position.set(0, -0.02, 0.9);
    iris.scale.set(0.42, 0.6, 0.08);
    eye.add(iris);

    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(1, 24, 12),
      pupilMaterial
    );
    pupil.name = `${name}Pupil`;
    pupil.position.set(0, -0.02, 0.98);
    pupil.scale.set(0.2, 0.28, 0.04);
    eye.add(pupil);

    const catchlight = new THREE.Mesh(
      new THREE.SphereGeometry(1, 12, 8),
      highlightMaterial
    );
    catchlight.name = `${name}Catchlight`;
    catchlight.position.set(-0.16, 0.22, 1.02);
    catchlight.scale.set(0.07, 0.09, 0.02);
    eye.add(catchlight);

    const createLid = (
      lidName: string,
      openY: number,
      closedY: number,
      scaleY: number
    ) => {
      const lid = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 12),
        eyelidMaterial
      );
      lid.name = lidName;
      lid.position.set(0, openY, 1.04);
      lid.scale.set(1.08, scaleY, 0.07);
      lid.userData.openY = openY;
      lid.userData.closedY = closedY;
      return lid;
    };

    const upperLid = createLid(`${name}UpperLid`, 0.78, 0.08, 0.44);
    const lowerLid = createLid(`${name}LowerLid`, -0.78, -0.08, 0.34);
    eye.add(upperLid);
    eye.add(lowerLid);

    eyes.userData.blinkTargets.push(upperLid, lowerLid);
    eyes.userData.lookTargets.push(eye);
    return eye;
  };

  eyes.add(createEye("LeftEye", -eyeX));
  eyes.add(createEye("RightEye", eyeX));

  eyes.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  return eyes;
}

function createTShirtBust(size: THREE.Vector3) {
  const bust = new THREE.Group();
  bust.name = "Body";

  const shirtMaterial = new THREE.MeshStandardMaterial({
    color: "#f5f1ed",
    roughness: 0.72,
    metalness: 0.02,
  });
  const neckMaterial = new THREE.MeshStandardMaterial({
    color: "#d6c2b8",
    roughness: 0.6,
  });

  const shoulderWidth = Math.max(size.x * 1.12, size.y * 0.62);
  const shoulderHeight = size.y * 0.18;
  const shoulderDepth = Math.max(size.z * 0.48, size.y * 0.2);

  const shoulders = new THREE.Mesh(
    new THREE.SphereGeometry(1, 48, 24),
    shirtMaterial
  );
  shoulders.name = "WhiteTShirtShoulders";
  shoulders.scale.set(shoulderWidth * 0.5, shoulderHeight, shoulderDepth);
  shoulders.position.set(0, -size.y * 0.46, 0);
  shoulders.rotation.x = -0.03;
  bust.add(shoulders);

  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(
      shoulderWidth * 0.32,
      shoulderWidth * 0.5,
      size.y * 0.38,
      48,
      1,
      true
    ),
    shirtMaterial
  );
  torso.name = "WhiteTShirtTorso";
  torso.position.set(0, -size.y * 0.64, 0);
  torso.scale.z = shoulderDepth / (shoulderWidth * 0.5);
  bust.add(torso);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(size.x * 0.12, size.x * 0.15, size.y * 0.18, 32),
    neckMaterial
  );
  neck.name = "Neck";
  neck.position.set(0, -size.y * 0.3, 0);
  bust.add(neck);

  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(size.x * 0.17, size.y * 0.015, 12, 48),
    shirtMaterial
  );
  collar.name = "TShirtCollar";
  collar.position.set(0, -size.y * 0.41, 0);
  collar.rotation.x = Math.PI / 2;
  collar.scale.z = 0.72;
  bust.add(collar);

  bust.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });

  return bust;
}

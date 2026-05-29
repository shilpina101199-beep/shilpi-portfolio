import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleHeadRotation,
  handleTouchMove,
} from "./utils/mouseUtils";
import setAnimations from "./utils/animationUtils";
import { setProgress } from "../Loading";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  const [character, setChar] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (canvasDiv.current) {
      let rect = canvasDiv.current.getBoundingClientRect();
      let container = { width: rect.width, height: rect.height };
      const aspect = container.width / container.height;
      const scene = sceneRef.current;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      renderer.setSize(container.width, container.height);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
      canvasDiv.current.appendChild(renderer.domElement);

      const camera = new THREE.PerspectiveCamera(14.5, aspect, 0.1, 1000);
      camera.position.z = 10;
      camera.position.set(0, 13.1, 24.7);
      camera.zoom = 1.1;
      camera.updateProjectionMatrix();

      let headBone: THREE.Object3D | null = null;
      let screenLight: any | null = null;
      let eyeBlinkTargets: THREE.Object3D[] = [];
      let eyeLookTargets: THREE.Object3D[] = [];
      const blink = { next: 1.4, start: -1, duration: 0.16 };
      let mixer: THREE.AnimationMixer;

      const clock = new THREE.Clock();

      const light = setLighting(scene);
      let progress = setProgress((value) => setLoading(value));
      const { loadCharacter } = setCharacter(renderer, scene, camera);

      loadCharacter().then((gltf) => {
        if (gltf) {
          const animations = setAnimations(gltf);
          hoverDivRef.current && animations.hover(gltf, hoverDivRef.current);
          mixer = animations.mixer;
          let character = gltf.scene;
          setChar(character);
          scene.add(character);
          headBone =
            (character.userData.headTarget as THREE.Object3D | undefined) ||
            character.getObjectByName("Head") ||
            character.getObjectByName("spine006") ||
            character;
          screenLight = character.getObjectByName("screenlight") || null;
          eyeBlinkTargets =
            (character.getObjectByName("Eyes")?.userData
              .blinkTargets as THREE.Object3D[] | undefined) || [];
          eyeLookTargets =
            (character.getObjectByName("Eyes")?.userData
              .lookTargets as THREE.Object3D[] | undefined) || [];
          progress.loaded().then(() => {
            setTimeout(() => {
              light.turnOnLights();
              animations.startIntro();
            }, 2500);
          });
          window.addEventListener("resize", () =>
            handleResize(renderer, camera, canvasDiv, character)
          );
        }
      });

      let mouse = { x: 0, y: 0 },
        interpolation = { x: 0.1, y: 0.2 };

      const onMouseMove = (event: MouseEvent) => {
        handleMouseMove(event, (x, y) => (mouse = { x, y }));
      };
      let debounce: number | undefined;
      const onTouchStart = (event: TouchEvent) => {
        const element = event.target as HTMLElement;
        debounce = setTimeout(() => {
          element?.addEventListener("touchmove", (e: TouchEvent) =>
            handleTouchMove(e, (x, y) => (mouse = { x, y }))
          );
        }, 200);
      };

      const onTouchEnd = () => {
        handleTouchEnd((x, y, interpolationX, interpolationY) => {
          mouse = { x, y };
          interpolation = { x: interpolationX, y: interpolationY };
        });
      };

      document.addEventListener("mousemove", (event) => {
        onMouseMove(event);
      });
      const landingDiv = document.getElementById("landingDiv");
      if (landingDiv) {
        landingDiv.addEventListener("touchstart", onTouchStart);
        landingDiv.addEventListener("touchend", onTouchEnd);
      }
      const animate = () => {
        requestAnimationFrame(animate);
        if (headBone) {
          handleHeadRotation(
            headBone,
            mouse.x,
            mouse.y,
            interpolation.x,
            interpolation.y,
            THREE.MathUtils.lerp
          );
          if (screenLight) light.setPointLight(screenLight);
        }
        const delta = clock.getDelta();
        updateEyeLook(eyeLookTargets, mouse.x, mouse.y);
        updateBlinkingEyes(eyeBlinkTargets, clock.elapsedTime, blink);
        if (mixer) {
          mixer.update(delta);
        }
        renderer.render(scene, camera);
      };
      animate();
      return () => {
        clearTimeout(debounce);
        scene.clear();
        renderer.dispose();
        window.removeEventListener("resize", () =>
          handleResize(renderer, camera, canvasDiv, character!)
        );
        if (canvasDiv.current) {
          canvasDiv.current.removeChild(renderer.domElement);
        }
        if (landingDiv) {
          document.removeEventListener("mousemove", onMouseMove);
          landingDiv.removeEventListener("touchstart", onTouchStart);
          landingDiv.removeEventListener("touchend", onTouchEnd);
        }
      };
    }
  }, []);

  return (
    <>
      <div className="character-container">
        <div className="character-model" ref={canvasDiv}>
          <div className="character-rim"></div>
          <div className="character-hover" ref={hoverDivRef}></div>
        </div>
      </div>
    </>
  );
};

export default Scene;

function updateEyeLook(eyes: THREE.Object3D[], mouseX: number, mouseY: number) {
  eyes.forEach((eye) => {
    const basePosition = eye.userData.basePosition as THREE.Vector3 | undefined;
    if (!basePosition) return;

    eye.position.x = THREE.MathUtils.lerp(
      eye.position.x,
      basePosition.x + mouseX * 0.014,
      0.12
    );
    eye.position.y = THREE.MathUtils.lerp(
      eye.position.y,
      basePosition.y + mouseY * 0.008,
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
      if (
        typeof eye.userData.openY === "number" &&
        typeof eye.userData.closedY === "number"
      ) {
        eye.position.y = THREE.MathUtils.lerp(
          eye.userData.openY,
          eye.userData.closedY,
          closeAmount
        );
        return;
      }

      const baseScaleY =
        typeof eye.userData.baseScaleY === "number"
          ? eye.userData.baseScaleY
          : eye.scale.y;
      eye.scale.y = baseScaleY * THREE.MathUtils.lerp(1, 0.08, closeAmount);
    });

    if (progress >= 1) {
      eyes.forEach((eye) => {
        if (typeof eye.userData.openY === "number") {
          eye.position.y = eye.userData.openY;
          return;
        }

        if (typeof eye.userData.baseScaleY === "number") {
          eye.scale.y = eye.userData.baseScaleY;
        }
      });
      blink.start = -1;
      blink.next = elapsedTime + 2.2 + Math.random() * 2.8;
    }
  }
}

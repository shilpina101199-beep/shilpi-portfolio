import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
  RapierRigidBody,
} from "@react-three/rapier";

const designTools = [
  { label: "Figma", short: "Fi", color: "#ff7262", accent: "#a259ff" },
  { label: "Adobe XD", short: "Xd", color: "#ff61f6", accent: "#470137" },
  { label: "Photoshop", short: "Ps", color: "#31a8ff", accent: "#001e36" },
  { label: "Illustrator", short: "Ai", color: "#ff9a00", accent: "#330000" },
  { label: "After Effects", short: "Ae", color: "#9999ff", accent: "#00005b" },
  { label: "Blender", short: "Bl", color: "#f5792a", accent: "#17324a" },
  { label: "Rhino", short: "Rh", color: "#d9d9d9", accent: "#353535" },
  { label: "Fusion 360", short: "F360", color: "#f5a623", accent: "#4f2f00" },
  { label: "Miro", short: "Mi", color: "#ffd02f", accent: "#050038" },
  { label: "Prototyping", short: "Proto", color: "#c2a4ff", accent: "#241342" },
];

const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);

const spheres = [...Array(30)].map((_, index) => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
  toolIndex: index % designTools.length,
}));

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  material: THREE.MeshPhysicalMaterial;
  isActive: boolean;
};

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
  material,
  isActive,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);

  useFrame((_state, delta) => {
    if (!isActive) return;
    delta = Math.min(0.1, delta);
    const impulse = vec
      .copy(api.current!.translation())
      .normalize()
      .multiply(
        new THREE.Vector3(
          -50 * delta * scale,
          -150 * delta * scale,
          -50 * delta * scale
        )
      );

    api.current?.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      position={[r(20), r(20) - 25, r(20) - 10]}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * scale]}
        args={[0.15 * scale, 0.275 * scale]}
      />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={sphereGeometry}
        material={material}
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

type PointerProps = {
  vec?: THREE.Vector3;
  isActive: boolean;
};

function Pointer({ vec = new THREE.Vector3(), isActive }: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive) return;
    const targetVec = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.2
    );
    ref.current?.setNextKinematicTranslation(targetVec);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

const TechStack = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const threshold = document
        .getElementById("work")!
        .getBoundingClientRect().top;
      setIsActive(scrollY > threshold);
    };
    document.querySelectorAll(".header a").forEach((elem) => {
      const element = elem as HTMLAnchorElement;
      element.addEventListener("click", () => {
        const interval = setInterval(() => {
          handleScroll();
        }, 10);
        setTimeout(() => {
          clearInterval(interval);
        }, 1000);
      });
    });
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  const materials = useMemo(() => {
    return designTools.map((tool) => {
      const texture = createToolTexture(tool);
      return (
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: tool.color,
          emissiveMap: texture,
          emissiveIntensity: 0.18,
          metalness: 0.25,
          roughness: 0.55,
          clearcoat: 0.35,
        })
      );
    });
  }, []);

  return (
    <div className="techstack">
      <h2> My Design Toolkit</h2>

      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: false, antialias: false }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => (state.gl.toneMappingExposure = 1.5)}
        className="tech-canvas"
      >
        <ambientLight intensity={1} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="white"
          castShadow
          shadow-mapSize={[512, 512]}
        />
        <directionalLight position={[0, 5, -4]} intensity={2} />
        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          {spheres.map((props, i) => (
            <SphereGeo
              key={i}
              {...props}
              material={materials[props.toolIndex]}
              isActive={isActive}
            />
          ))}
        </Physics>
        <Environment
          files="/models/char_enviorment.hdr"
          environmentIntensity={0.5}
          environmentRotation={[0, 4, 2]}
        />
        <EffectComposer enableNormalPass={false}>
          <N8AO color="#0f002c" aoRadius={2} intensity={1.15} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default TechStack;

function createToolTexture(tool: (typeof designTools)[number]) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d")!;

  const glow = context.createRadialGradient(180, 150, 40, 256, 256, 320);
  glow.addColorStop(0, "#ffffff");
  glow.addColorStop(0.2, tool.color);
  glow.addColorStop(0.72, tool.accent);
  glow.addColorStop(1, "#0b080c");
  context.fillStyle = glow;
  context.fillRect(0, 0, 512, 512);

  context.globalAlpha = 0.2;
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.arc(150, 120, 68, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  context.fillStyle = "rgba(11, 8, 12, 0.76)";
  roundRect(context, 108, 122, 296, 196, 36);
  context.fill();

  context.strokeStyle = tool.color;
  context.lineWidth = 10;
  context.stroke();

  context.fillStyle = "#ffffff";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `700 ${tool.short.length > 3 ? 58 : 86}px Geist, Arial, sans-serif`;
  context.fillText(tool.short, 256, 210);

  context.font = "600 34px Geist, Arial, sans-serif";
  context.fillStyle = "#f2edf6";
  context.fillText(tool.label, 256, 365);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

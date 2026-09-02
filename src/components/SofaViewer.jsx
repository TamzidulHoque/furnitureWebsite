// MODERN mode: real-time 3D velvet sofa (KHR_materials_variants).
// Model: GlamVelvetSofa © 2021 Wayfair — CC BY 4.0 (credited in footer).
import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows } from '@react-three/drei';

const MODEL = '/models/sofa.glb';

function Sofa({ variant, legColor }) {
  const { scene, parser } = useGLTF(MODEL);

  // fabric: switch the glTF material variant
  useEffect(() => {
    const ext = parser.json.extensions?.KHR_materials_variants;
    if (!ext) return;
    const idx = ext.variants.findIndex((v) => v.name === variant);
    scene.traverse((o) => {
      const def = o.userData?.gltfExtensions?.KHR_materials_variants;
      if (!o.isMesh || !def) return;
      if (!o.userData.origMat) o.userData.origMat = o.material;
      const mapping = def.mappings.find((mp) => mp.variants.includes(idx));
      if (mapping != null) {
        parser.getDependency('material', mapping.material).then((mat) => { o.material = mat; });
      } else {
        o.material = o.userData.origMat;
      }
    });
  }, [variant, scene, parser]);

  // legs: tint the wood material
  useEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh && o.material?.name?.toLowerCase().includes('legs')) {
        if (!o.userData.legMat) {
          o.userData.legMat = o.material.clone();
          o.material = o.userData.legMat;
        }
        o.userData.legMat.color.set(legColor);
      }
    });
  }, [legColor, scene]);

  return <primitive object={scene} />;
}

export default function SofaViewer({ variant, legColor }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [2.1, 1.15, 2.5], fov: 38 }}
      style={{ width: '100%', aspectRatio: '1024 / 742', borderRadius: 'var(--radius)' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} />
      <directionalLight position={[-5, 3, -2]} intensity={0.5} color="#ffe9c4" />
      <Suspense fallback={null}>
        <group position={[0, -0.42, 0]}>
          <Sofa variant={variant} legColor={legColor} />
          <ContactShadows opacity={0.4} scale={6} blur={2.4} far={2} resolution={512} />
        </group>
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.7}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.05}
        target={[0, 0.12, 0]}
      />
    </Canvas>
  );
}

useGLTF.preload(MODEL);

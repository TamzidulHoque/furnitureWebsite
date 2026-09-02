// Real-time 3D furniture previews (lazy-loaded — three.js only ships to
// visitors who open a 3D piece). Models from the Khronos glTF sample
// library, CC BY 4.0 / CC0 — credited in the footer.
import { Suspense, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, ContactShadows } from '@react-three/drei';

// ── model registry ──────────────────────────────────────────────
// fabric / wood option modes:
//   variant      → switch a KHR_materials_variants variant
//   reupholster  → clone material, drop base texture, set flat colour
//   tint         → multiply material colour (dark finishes only)
//   swap         → point meshes at another material in the file (by name)
import { MODELS } from './modelRegistry.js';


function applyOptions(scene, parser, model, fabricIdx, woodIdx) {
  const fab = model.fabric?.options[fabricIdx];
  const woo = model.wood?.options?.[woodIdx];

  // fabric — variant switching
  if (model.fabric?.mode === 'variant' && fab) {
    const ext = parser.json.extensions?.KHR_materials_variants;
    if (ext) {
      const idx = ext.variants.findIndex((v) => v.name === fab.variant);
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
    }
  }

  // fabric — reupholster (flat colour, keep normal/roughness for weave)
  if (model.fabric?.mode === 'reupholster' && fab) {
    scene.traverse((o) => {
      if (!o.isMesh || !model.fabric.match.test(o.material?.userData?.baseName ?? o.material?.name ?? '')) return;
      if (!o.userData.origMat) o.userData.origMat = o.material;
      if (fab.original) { o.material = o.userData.origMat; return; }
      if (!o.userData.reMat) {
        o.userData.reMat = o.userData.origMat.clone();
        o.userData.reMat.userData.baseName = o.userData.origMat.name;
        o.userData.reMat.map = null;
      }
      o.userData.reMat.color.set(fab.color);
      o.material = o.userData.reMat;
    });
  }

  // wood — tint in place
  if (model.wood?.mode === 'tint' && woo) {
    scene.traverse((o) => {
      if (!o.isMesh || !model.wood.match.test(o.material?.userData?.baseName ?? o.material?.name ?? '')) return;
      if (!o.userData.woodMat) {
        o.userData.woodMat = o.material.clone();
        o.userData.woodMat.userData.baseName = o.material.name;
        o.userData.woodOrigColor = o.material.color.clone();
        o.material = o.userData.woodMat;
      }
      if (woo.original) o.userData.woodMat.color.copy(o.userData.woodOrigColor);
      else o.userData.woodMat.color.set(woo.color);
    });
  }
}

const DRACO_PATH = '/draco/'; // self-hosted decoder — no CDN, works offline

function Model({ modelKey, fabricIdx, woodIdx }) {
  const model = MODELS[modelKey];
  const { scene, parser } = useGLTF(model.url, DRACO_PATH);
  useEffect(() => {
    applyOptions(scene, parser, model, fabricIdx, woodIdx);
  }, [scene, parser, model, fabricIdx, woodIdx]);
  return <primitive object={scene} />;
}

export default function ModelViewer({ modelKey, fabricIdx = 0, woodIdx = 0 }) {
  const model = MODELS[modelKey];
  const key = useMemo(() => modelKey, [modelKey]); // remount canvas per model (clean camera)
  return (
    <Canvas
      key={key}
      dpr={[1, 2]}
      camera={{ position: model.camera, fov: model.fov }}
      style={{ width: '100%', aspectRatio: '1024 / 742', borderRadius: 'var(--radius)' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} />
      <directionalLight position={[-5, 3, -2]} intensity={0.5} color="#ffe9c4" />
      <Suspense fallback={null}>
        <group position={model.offset}>
          <Model modelKey={modelKey} fabricIdx={fabricIdx} woodIdx={woodIdx} />
          <ContactShadows opacity={0.4} scale={7} blur={2.4} far={2.2} resolution={512} />
        </group>
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.7}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.05}
        target={model.target}
      />
    </Canvas>
  );
}

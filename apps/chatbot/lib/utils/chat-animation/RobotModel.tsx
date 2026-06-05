// "use client";

// import React, { useRef } from "react";
// import { useFrame } from "@react-three/fiber";
// import { MeshDistortMaterial, Sphere, Float } from "@react-three/drei";
// import * as THREE from "three";

// export default function RobotModel() {
//   const headRef = useRef<THREE.Group>(null);

//   useFrame((state) => {
//     if (headRef.current) {
//       const { x, y } = state.mouse;
//       headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, x * 0.5, 0.1);
//       headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -y * 0.3, 0.1);
//     }
//   });

//   return (
//     <Float speed={3} rotationIntensity={0.5} floatIntensity={1}>
//       <group>
//         <group ref={headRef}>
//           <mesh>
//             <boxGeometry args={[1.5, 1.2, 1.2]} />
//             <meshStandardMaterial color="#1c1c27" roughness={0.1} metalness={0.8} />
//           </mesh>

//           <mesh position={[-0.4, 0.1, 0.6]}>
//             <sphereGeometry args={[0.15, 16, 16]} />
//             <meshBasicMaterial color="#6c63ff" />
//           </mesh>
//           <mesh position={[0.4, 0.1, 0.6]}>
//             <sphereGeometry args={[0.15, 16, 16]} />
//             <meshBasicMaterial color="#6c63ff" />
//           </mesh>

//           <mesh position={[0, 0.1, 0.55]}>
//             <boxGeometry args={[1.2, 0.5, 0.1]} />
//             <meshStandardMaterial color="#6c63ff" transparent opacity={0.3} />
//           </mesh>
//         </group>

//         <mesh position={[0, -1.2, 0]}>
//           <cylinderGeometry args={[0.8, 0.5, 1, 32]} />
//           <meshStandardMaterial color="#13131a" metalness={0.9} />
//         </mesh>

//         <mesh position={[-1, -0.8, 0]}>
//           <sphereGeometry args={[0.2, 16, 16]} />
//           <meshStandardMaterial color="#6c63ff" />
//         </mesh>
//         <mesh position={[1, -0.8, 0]}>
//           <sphereGeometry args={[0.2, 16, 16]} />
//           <meshStandardMaterial color="#6c63ff" />
//         </mesh>

//         <Sphere args={[0.4, 16, 16]} position={[0, -1.8, 0]}>
//           <MeshDistortMaterial
//             color="#6c63ff"
//             attach="material"
//             distort={0.4}
//             speed={2}
//           />
//         </Sphere>
//       </group>
//     </Float>
//   );
// }

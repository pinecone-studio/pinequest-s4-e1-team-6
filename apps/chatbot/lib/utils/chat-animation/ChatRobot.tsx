// "use client";

// import { Canvas } from "@react-three/fiber";
// import { OrbitControls, Stage } from "@react-three/drei";
// import RobotModel from "./RobotModel";
// import { motion } from "framer-motion";

// export default function ChatRobot() {
//   return (
//     <motion.div
//       initial={{ scale: 0, opacity: 0 }}
//       animate={{ scale: 1, opacity: 1 }}
//       transition={{ type: "spring", stiffness: 260, damping: 20 }}
//       className="w-48 h-48 cursor-grab active:cursor-grabbing"
//     >
//       <Canvas shadows camera={{ position: [0, 0, 5], fov: 40 }}>
//         <ambientLight intensity={0.5} />
//         <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
//         <pointLight position={[-10, -10, -10]} />

//         <Stage environment="city" intensity={0.5}>
//           <RobotModel />
//         </Stage>

//         <OrbitControls
//           enableZoom={false}
//           enablePan={false}
//           minPolarAngle={Math.PI / 2.5}
//           maxPolarAngle={Math.PI / 1.5}
//         />
//       </Canvas>
//     </motion.div>
//   );
// }

import React from 'react'

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold">Төлбөрийн хэсэг</h1>
    </div>
  );
}

// "use client";

// import React, { useState } from 'react';
// export default function PaymentPage() {
//   // 'address' эсвэл 'payment' гэсэн алхмуудтай байна
//   const [activeStep, setActiveStep] = useState<"address" | "payment" | null>("address");
  
//   // Жишээ өгөгдлүүд
//   const totalAmount = 55000;
//   const orderId = `ORD-${Math.floor(Math.random() * 100000)}`;

//   const handleAddressConfirm = () => {
//     // Хаяг амжилттай болмогц төлбөр рүү шилжинэ
//     setActiveStep("payment");
//   };

//   const handlePaymentSuccess = (details: any) => {
//     console.log("Төлбөр амжилттай:", details);
//     // Амжилттай болсны дараа өөр хуудас руу шилжих эсвэл статус харуулах
//     alert("Баярлалаа! Таны төлбөр амжилттай хийгдлээ.");
//     setActiveStep(null);
//   };

//   return (
//     <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
//       <div className="text-center mb-8">
//         <h1 className="text-3xl font-bold mb-2">Захиалга баталгаажуулах</h1>
//         <p className="text-slate-400">Та хүргэлтийн хаягаа оруулаад төлбөрөө төлнө үү.</p>
//       </div>

//       <div className="w-full max-w-lg">
//         {/* 1. ХАЯГ ОРУУЛАХ ХЭСЭГ */}
//         {activeStep === "address" && (
//           <OrderAddress 
//             onClose={() => console.log("Хаах")} 
//             onConfirm={handleAddressConfirm} 
//           />
//         )}

//         {/* 2. QPAY ТӨЛБӨР ХИЙХ ХЭСЭГ */}
//         {activeStep === "payment" && (
//           <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
//             <QPayPayment 
//               amount={totalAmount}
//               orderId={orderId}
//               onSuccess={handlePaymentSuccess}
//               onCancel={() => setActiveStep("address")} // Буцах бол хаяг руугаа буцна
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
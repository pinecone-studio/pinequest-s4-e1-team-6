"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => setOrder(data));
  }, [id]);

  if (!order) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-xl mb-4">Order #{order.id}</h1>

      <div className="mb-4">
        <p>Total: ${order.total}</p>
        <p>Status: {order.status}</p>
        <p>Date: {new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <h2 className="text-lg mb-2">Products</h2>

      <div className="space-y-2">
        {order.items?.map((item: any) => (
          <div
            key={item.id}
            className="border border-gray-700 p-3 rounded"
          >
            <p>Name: {item.product?.name}</p>
            <p>Price: ${item.product?.price}</p>
            <p>Quantity: {item.quantity}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
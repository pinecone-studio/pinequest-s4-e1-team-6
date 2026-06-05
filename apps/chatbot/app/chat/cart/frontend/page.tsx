import CartList from "./components/CartList";

export default function CartPage() {
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>

      <CartList />
    </div>
  );
}

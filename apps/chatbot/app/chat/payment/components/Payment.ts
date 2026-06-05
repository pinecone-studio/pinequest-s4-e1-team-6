const handleFakePayment = async (orderId: any) => {

  const response = await fetch('/api/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: orderId,
      status: 'success',
      secret_token: 'demo_secret_123'
    })
  });

  if (response.ok) {
    alert("Төлбөр амжилттай! Захиалга баталгаажлаа.");
  }
};
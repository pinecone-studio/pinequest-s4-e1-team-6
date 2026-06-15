const sendOtp = async () => {
  setSendingOtp(true);
  setError("");
  try {
    const res = await fetch("/chat/api/store/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (data.success) {
      setOtpCode(data.code);
      setOtpSent(true);
    } else {
      setError(data.error || "Код илгээхэд алдаа гарлаа");
    }
  } catch {
    setError("Сүлжээний алдаа гарлаа");
  } finally {
    setSendingOtp(false);
  }
};

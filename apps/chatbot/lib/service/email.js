import emailjs from '@emailjs/browser';

export const sendOrderEmail = async (user, orderDetails, items) => {
  try {
    const ordersHtml = items.map((item) => `
      <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
        <tr style="vertical-align: top">
          <td style="padding: 10px 8px 0 4px; width: 64px">
            <img style="height: 64px; border-radius: 4px;" height="64" width="64" src="${item.thumbnail || item.image_url || ''}" alt="item" />
          </td>
          <td style="padding: 10px 8px 0 8px; width: 100%">
            <div style="font-size: 14px; font-weight: 500;">${item.name || item.title || 'Бүтээгдэхүүн'}</div>
            <div style="font-size: 13px; color: #888; padding-top: 4px">QTY: ${item.quantity || 1}</div>
          </td>
          <td style="padding: 10px 4px 0 0; white-space: nowrap; text-align: right;">
            <strong>$${item.price}</strong>
          </td>
        </tr>
      </table>
    `).join("");

    const templateParams = {
      email: user?.primaryEmailAddress?.emailAddress || user?.email,
      user_name: user?.firstName || "Хэрэглэгч",
      order_id: orderDetails.id.slice(-8).toUpperCase(),
      orders_list: ordersHtml,
      shipping: "0.00",
      tax: (orderDetails.amount * 0.1).toFixed(2),
      total: orderDetails.amount.toLocaleString()
    };
    
    return await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    );
  } catch (error) {
    console.error("EmailJS Error:", error);
    throw error;
  }
};
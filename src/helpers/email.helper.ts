import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // upgrade later with STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async (to: string, subject: string, html: string) => {
  await transporter.sendMail({
    from: `"SHARPLOOK" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

export const sendVendorOrderEmail = async (
  to: string,
  {
    name,
    items,
    total,
  }: {
    name: string;
    items: { productName: string; quantity: number; price: number; total: number }[];
    total: number;
  }
) => {
  const productList = items
    .map(
      (item) =>
        `<li>${item.productName} — ₦${item.price} × ${item.quantity} = ₦${item.total}</li>`
    )
    .join("");

  const html = `
    <p>Hi ${name},</p>
    <p>Congratulations! You've just received a new order with the following item(s):</p>
    <ul>${productList}</ul>
    <p><strong>Total: ₦${total}</strong></p>
    <p>Log in to your dashboard to manage your orders.</p>
    <p>— Your SHARP Platform</p>
  `;

  // Replace with nodemailer, sendgrid, or any provider
 await sendMail(
  to,
  "New Product Order Received",
  html
);
};

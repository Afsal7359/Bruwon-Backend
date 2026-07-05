import nodemailer from 'nodemailer';

let transporter = null;

export function getTransporter() {
  if (transporter) return transporter;
  const user = process.env.MAIL_USER;
  const pass = (process.env.MAIL_APP_PASSWORD || '').replace(/\s+/g, ''); // Gmail app password (spaces stripped)
  if (!user || !pass) return null;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    pool: true,
    maxConnections: 2,
    maxMessages: 50,
    connectionTimeout: 15000,
    greetingTimeout: 10000,
  });
  return transporter;
}

// Gmail occasionally drops a connection ("Unexpected socket close"); retry once.
async function sendWithRetry(mailOptions) {
  const t = getTransporter();
  try {
    return await t.sendMail(mailOptions);
  } catch (e) {
    await new Promise((r) => setTimeout(r, 1200));
    return t.sendMail(mailOptions);
  }
}

export function isMailConfigured() {
  return !!getTransporter();
}

const CUR = () => process.env.CURRENCY || 'INR';
const rupee = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

function itemsTable(order) {
  const rows = order.items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee;color:#3b2414;">${i.name} <span style="color:#8a7a68;">× ${i.qty}</span></td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;color:#3b2414;">${rupee(i.price * i.qty)}</td>
      </tr>`
    )
    .join('');
  return `
    <table style="width:100%;border-collapse:collapse;font-size:15px;">
      ${rows}
      <tr><td style="padding:10px 0;color:#8a7a68;">Subtotal</td><td style="padding:10px 0;text-align:right;color:#8a7a68;">${rupee(order.subtotal)}</td></tr>
      <tr><td style="padding:4px 0;color:#8a7a68;">Shipping</td><td style="padding:4px 0;text-align:right;color:#8a7a68;">${order.shipping ? rupee(order.shipping) : 'Free'}</td></tr>
      <tr><td style="padding:12px 0 0;font-weight:700;color:#3b2414;font-size:17px;">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:700;color:#3b2414;font-size:17px;">${rupee(order.total)}</td></tr>
    </table>`;
}

function addressBlock(c) {
  const a = c.address || {};
  const lines = [a.line1, a.line2, [a.city, a.state].filter(Boolean).join(', '), a.zip, a.country]
    .filter(Boolean)
    .join('<br>');
  return lines || '—';
}

function shell(title, intro, order) {
  const c = order.customer || {};
  return `
  <div style="background:#f4efe7;padding:28px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ece3d3;">
      <div style="background:#3b2414;padding:22px 28px;">
        <span style="color:#E7C188;font-size:22px;font-weight:800;letter-spacing:-0.5px;">Bruwon™</span>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 6px;font-size:22px;color:#3b2414;">${title}</h1>
        <p style="margin:0 0 20px;color:#6b5b48;font-size:15px;line-height:1.6;">${intro}</p>

        <div style="background:#faf6ee;border:1px solid #ece3d3;border-radius:12px;padding:16px 18px;margin-bottom:20px;">
          <div style="color:#8a7a68;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Order</div>
          <div style="color:#3b2414;font-size:18px;font-weight:700;">${order.orderNumber}</div>
          ${order.payment?.razorpayPaymentId ? `<div style="color:#8a7a68;font-size:13px;margin-top:4px;">Payment ID: ${order.payment.razorpayPaymentId}</div>` : ''}
        </div>

        ${itemsTable(order)}

        <div style="margin-top:24px;border-top:1px solid #ece3d3;padding-top:18px;">
          <div style="color:#8a7a68;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Ship to</div>
          <div style="color:#3b2414;font-size:15px;line-height:1.6;">
            <strong>${c.name || ''}</strong><br>
            ${addressBlock(c)}<br>
            ${c.phone ? `📞 ${c.phone}<br>` : ''}
            ✉️ ${c.email || ''}
          </div>
        </div>
      </div>
      <div style="background:#faf6ee;padding:16px 28px;color:#a4917a;font-size:12px;text-align:center;">
        Bruwon™ · Handcrafted pistachio-kunafa chocolate
      </div>
    </div>
  </div>`;
}

// Fire the confirmation emails for a paid order. Never throws — email failure
// must not break the payment flow.
export async function sendOrderEmails(order) {
  const t = getTransporter();
  if (!t) {
    console.log('• Mail not configured — skipping order emails');
    return { skipped: true };
  }

  const fromName = process.env.MAIL_FROM_NAME || 'Bruwon';
  const from = `${fromName} <${process.env.MAIL_USER}>`;
  const adminTo = process.env.MAIL_TO || process.env.MAIL_USER;
  const results = {};

  // 1. Admin / owner notification
  try {
    await sendWithRetry({
      from,
      to: adminTo,
      subject: `🍫 New paid order ${order.orderNumber} — ${rupee(order.total)}`,
      html: shell(
        'New order received',
        `A new order has been paid and confirmed. Total <strong>${rupee(order.total)}</strong>.`,
        order
      ),
    });
    results.admin = 'sent';
  } catch (e) {
    console.error('✖ Admin order email failed:', e.message);
    results.admin = 'failed';
  }

  // 2. Customer confirmation
  if (order.customer?.email) {
    try {
      await sendWithRetry({
        from,
        to: order.customer.email,
        subject: `Your Bruwon order ${order.orderNumber} is confirmed 🍫`,
        html: shell(
          `Thank you${order.customer.name ? ', ' + order.customer.name.split(' ')[0] : ''}!`,
          'Your payment was successful and your order is confirmed. We&rsquo;re packing it fresh — you&rsquo;ll hear from us when it ships.',
          order
        ),
      });
      results.customer = 'sent';
    } catch (e) {
      console.error('✖ Customer order email failed:', e.message);
      results.customer = 'failed';
    }
  }

  return results;
}

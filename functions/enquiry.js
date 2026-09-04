export async function onRequestPost({ request, env }) {
  const formData = await request.formData();
  const required = ['name', 'company', 'email', 'phone', 'country', 'product', 'quantity'];
  const payload = Object.fromEntries(formData.entries());

  const missing = required.filter((field) => !String(payload[field] || '').trim());
  if (missing.length) {
    return new Response(JSON.stringify({ success: false, message: 'Please complete the required fields.' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const email = String(payload.email || '').trim();
  const phone = String(payload.phone || '').trim();
  const name = String(payload.name || '').trim();
  const company = String(payload.company || '').trim();
  const country = String(payload.country || '').trim();
  const product = String(payload.product || '').trim();
  const quantity = String(payload.quantity || '').trim();
  const specification = String(payload.specification || '').trim();
  const destination = String(payload.destination || '').trim();
  const incoterm = String(payload.incoterm || '').trim();
  const message = String(payload.message || '').trim();
  const timestamp = new Date().toISOString();

  const body = [
    `Subject: New Website Enquiry – ${product} – ${company}`,
    '',
    `Name: ${name}`,
    `Company: ${company}`,
    `Country: ${country}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Product: ${product}`,
    `Quantity: ${quantity}`,
    `Specification: ${specification}`,
    `Destination: ${destination}`,
    `Incoterm: ${incoterm}`,
    `Message: ${message}`,
    `Submission timestamp: ${timestamp}`,
  ].join('\n');

  if (!env.RESEND_API_KEY) {
    return new Response(JSON.stringify({ success: false, message: 'Email delivery is not configured on this deployment.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Janata Global Exports <onboarding@resend.dev>',
      to: ['sales@janataglobal.com'],
      subject: `New Website Enquiry – ${product} – ${company}`,
      text: body,
      reply_to: email,
    }),
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ success: false, message: 'Your enquiry could not be sent right now. Please email sales@janataglobal.com directly.' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

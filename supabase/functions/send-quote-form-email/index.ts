import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import nodemailer from "npm:nodemailer@6.9.8";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Gmail SMTP configuration
const GMAIL_USER = Deno.env.get('GMAIL_USER') || '';
const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD') || '';
const RECIPIENT_EMAIL = Deno.env.get('RECIPIENT_EMAIL') || GMAIL_USER;

interface QuoteFormRequest {
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
    address?: string | null;
    message: string;
}

function generateEmailHTML(data: QuoteFormRequest): string {
    const { name, email, phone, company, address, message } = data;
    const brandColor = '#de2525';

    const now = new Date();
    const dateStr = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Neue Angebotsanfrage</title>
  <style type="text/css">
    * { box-sizing: border-box; }
    body, td, div, p, a, input { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    body { background-color: #f4f4f7; margin: 0; padding: 0; -webkit-text-size-adjust: none; width: 100% !important; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f7; padding: 40px 0; }
    .main-table { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden; }
    .header { background-color: #ffffff; padding: 30px 40px; border-bottom: 3px solid ${brandColor}; text-align: center; }
    .header h1 { color: #1a1a1a; font-size: 24px; font-weight: 700; margin: 0; }
    .header-meta { margin-top: 8px; color: #888888; font-size: 13px; font-weight: 500; }
    .content-cell { padding: 40px; }
    .section { margin-bottom: 35px; }
    .section-heading { color: ${brandColor}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 15px; border-bottom: 1px solid #eeeeee; padding-bottom: 10px; }
    .data-label { color: #888888; font-size: 12px; font-weight: 500; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .data-value { color: #1a1a1a; font-size: 16px; font-weight: 600; line-height: 1.4; margin-bottom: 20px; }
    .two-col { width: 100%; }
    .two-col td { width: 50%; vertical-align: top; }
    .footer { text-align: center; padding: 30px; color: #999999; font-size: 12px; background-color: #f4f4f7; }
    @media only screen and (max-width: 620px) {
      .content-cell { padding: 25px !important; }
      .two-col td { display: block; width: 100%; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="main-table" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td class="header">
          <h1>Neue Angebotsanfrage</h1>
          <div class="header-meta">Eingegangen am ${dateStr} um ${timeStr} Uhr</div>
        </td>
      </tr>
      <tr>
        <td class="content-cell">
          
          <!-- Kundendaten -->
          <div class="section">
            <div class="section-heading">Kundeninformationen</div>
            <table class="two-col">
              <tr>
                <td>
                  <span class="data-label">Name</span>
                  <div class="data-value">${name}</div>
                </td>
                <td>
                  <span class="data-label">E-Mail</span>
                  <div class="data-value">
                    <a href="mailto:${email}" style="color: #1a1a1a; text-decoration: none; border-bottom: 1px dotted #ccc;">${email}</a>
                  </div>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td>
                  <span class="data-label">Telefon</span>
                  <div class="data-value">
                    <a href="tel:${phone}" style="color: #1a1a1a; text-decoration: none; border-bottom: 1px dotted #ccc;">${phone}</a>
                  </div>
                </td>
                <td></td>
              </tr>` : ''}
              ${company || address ? `
              <tr>
                ${company ? `
                <td>
                  <span class="data-label">Firma</span>
                  <div class="data-value">${company}</div>
                </td>` : '<td></td>'}
                ${address ? `
                <td>
                  <span class="data-label">Adresse</span>
                  <div class="data-value" style="font-size: 14px;">${address}</div>
                </td>` : '<td></td>'}
              </tr>` : ''}
            </table>
          </div>

          <!-- Nachricht -->
          <div class="section">
            <div class="section-heading">Nachricht</div>
            <div style="background-color: #f9f9f9; border-left: 3px solid ${brandColor}; padding: 15px; border-radius: 0 4px 4px 0;">
              <p style="margin: 0; color: #444; font-size: 14px; line-height: 1.6;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>
          </div>

        </td>
      </tr>
    </table>
    
    <div class="footer">
      <p>System-Nachricht generiert vom Blank Klappladen-Konfigurator</p>
      <p style="margin-top: 5px; opacity: 0.5;">© ${new Date().getFullYear()} Blank</p>
    </div>
  </div>
</body>
</html>
  `;
}

function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASSWORD,
        },
    });
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const data: QuoteFormRequest = await req.json();

        if (!data.name || !data.email || !data.message) {
            return new Response(
                JSON.stringify({ error: 'Name, E-Mail und Nachricht sind erforderlich' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
            console.error('Gmail credentials not configured');
            return new Response(
                JSON.stringify({ error: 'Email service not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const emailHTML = generateEmailHTML(data);
        const subject = `Neue Angebotsanfrage von ${data.name}`;

        const transporter = createTransporter();

        await transporter.sendMail({
            from: `"Blank Konfigurator" <${GMAIL_USER}>`,
            to: RECIPIENT_EMAIL,
            replyTo: data.email,
            subject: subject,
            html: emailHTML,
        });

        console.log('Quote form email sent successfully to:', RECIPIENT_EMAIL);

        return new Response(
            JSON.stringify({ success: true, message: 'Email sent successfully' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({ error: (error as Error).message || 'Failed to send email' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

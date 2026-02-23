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

interface QuoteRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shutterType: string;
  material: string;
  designName: string;
  woodType?: string;
  ausstellerEnabled?: boolean;
  kombinationDesign1?: string;
  kombinationDesign2?: string;
  ralColor: string;
  rohUnbehandelt?: boolean;
  beschlaegeEnabled?: boolean | null;
  beschlaegeColor?: string;
  anschlagsart?: string;
  width: number;
  height: number;
  fluegelOption?: string;
  anzahlFenster?: number;
  sonderwuensche?: string;
  // price: number; // Removed price as per UI update
  technicalDetails?: {
    lamellaCount: number;
    spacing: number;
    frameThickness: number;
    totalWidth: number;
    totalHeight: number;
  };
}

// Map fluegelOption values to German labels
function getFluegelLabel(option: string): string {
  const labels: Record<string, string> = {
    'beide-seiten': 'Beide Seiten',
    'nur-links-ganz': 'Nur links - ganze Breite',
    'nur-rechts-ganz': 'Nur rechts - ganze Breite',
    'nur-links-halb': 'Nur links - halbe Breite',
    'nur-rechts-halb': 'Nur rechts - halbe Breite',
  };
  return labels[option] || option;
}

function generateEmailHTML(data: QuoteRequest): string {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shutterType,
    material,
    designName,
    woodType,
    ausstellerEnabled,
    kombinationDesign1,
    kombinationDesign2,
    ralColor,
    beschlaegeEnabled,
    beschlaegeColor,
    anschlagsart,
    width,
    height,
    fluegelOption,
    anzahlFenster,
    sonderwuensche,
    technicalDetails,
  } = data;

  const brandColor = '#de2525';

  // Format date parts separately to avoid locale errors
  const now = new Date();
  const dateStr = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>Neue Klappladen-Anfrage</title>
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
          <h1>Neue Anfrage</h1>
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
                  <div class="data-value">${customerName}</div>
                </td>
                <td>
                  <span class="data-label">Kontakt</span>
                  <div class="data-value">
                    <a href="mailto:${customerEmail}" style="color: #1a1a1a; text-decoration: none; border-bottom: 1px dotted #ccc;">${customerEmail}</a>
                    ${customerPhone ? `<br><a href="tel:${customerPhone}" style="color: #1a1a1a; text-decoration: none; border-bottom: 1px dotted #ccc;">${customerPhone}</a>` : ''}
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <!-- Konfiguration -->
          <div class="section">
            <div class="section-heading">Konfiguration</div>
            
            <!-- 1. Typ & Material -->
            <table class="two-col">
              <tr>
                <td>
                  <span class="data-label">1. Montageart</span>
                  <div class="data-value">${shutterType || 'Klappladen'}</div>
                </td>
                <td>
                  <span class="data-label">2. Material</span>
                  <div class="data-value">${material} ${woodType ? `(${woodType})` : ''}</div>
                </td>
              </tr>
            </table>

            <!-- 3. Design -->
            <table class="two-col">
              <tr>
                <td colspan="2">
                  <span class="data-label">3. Design</span>
                  <div class="data-value">
                    ${ausstellerEnabled && (kombinationDesign1 || kombinationDesign2)
      ? `Kombination: ${kombinationDesign1 || '?'} + ${kombinationDesign2 || '?'}`
      : designName}
                  </div>
                </td>
              </tr>
            </table>

            <!-- 4. Farbe -->
            <table class="two-col">
              <tr>
                <td colspan="2">
                  <span class="data-label">4. Farbe / Oberfläche</span>
                  <div class="data-value">${ralColor}</div>
                </td>
              </tr>
            </table>

            <!-- 5. Beschläge -->
             ${beschlaegeEnabled === true ? `
            <div style="background: #f9f9f9; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
              <div class="data-label" style="margin-bottom: 10px; color: ${brandColor};">5. Beschläge & Montage</div>
              <table class="two-col">
                <tr>
                   <td>
                     <span class="data-label">Anschlagsart</span>
                     <div class="data-value" style="font-size: 15px;">${anschlagsart || '-'}</div>
                   </td>
                   <td>
                     <span class="data-label">Beschläge Farbe</span>
                     <div class="data-value" style="font-size: 15px;">${beschlaegeColor || 'Standard'}</div>
                   </td>
                </tr>
              </table>
            </div>
            ` : `
            <table class="two-col">
              <tr>
                <td>
                  <span class="data-label">5. Beschläge</span>
                  <div class="data-value" style="color: #999;">Keine Beschläge ausgewählt</div>
                </td>
              </tr>
            </table>
            `}

            <!-- Maße & Fenster -->
            <div class="section-heading" style="margin-top: 30px;">Abmessungen</div>
            <table class="two-col">
              <tr>
                <td>
                  <span class="data-label">Fenstermaße (B x H)</span>
                  <div class="data-value">${width} x ${height} mm</div>
                </td>
                <td>
                  <span class="data-label">Anzahl Fenster</span>
                  <div class="data-value">${anzahlFenster || 1} Stück</div>
                </td>
              </tr>
              <tr>
                <td colspan="2">
                   <span class="data-label">Flügelanordnung</span>
                   <div class="data-value" style="margin-bottom: 0;">${fluegelOption ? getFluegelLabel(fluegelOption) : '-'}</div>
                </td>
              </tr>
               ${technicalDetails ? `
              <tr>
                <td colspan="2" style="padding-top: 15px;">
                  <span class="data-label">Gesamtmaß inkl. Rahmen</span>
                  <div class="data-value" style="font-size: 14px; color: #555; margin-bottom: 0;">${technicalDetails.totalWidth} x ${technicalDetails.totalHeight} mm</div>
                </td>
              </tr>` : ''}
            </table>
          </div>

          ${sonderwuensche ? `
          <div class="section">
            <div class="section-heading">Sonderwünsche</div>
            <div style="background-color: #fff1f1; border-left: 3px solid ${brandColor}; padding: 15px; border-radius: 0 4px 4px 0;">
              <p style="margin: 0; font-style: italic; color: #444; font-size: 14px; line-height: 1.5;">
                "${sonderwuensche.replace(/\n/g, '<br>')}"
              </p>
            </div>
          </div>
          ` : ''}

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

// Create nodemailer transporter for Gmail
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const data: QuoteRequest = await req.json();

    // Validate required fields
    if (!data.customerName || !data.customerEmail) {
      return new Response(
        JSON.stringify({ error: 'Name und E-Mail sind erforderlich' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check Gmail configuration
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error('Gmail credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate email HTML
    const emailHTML = generateEmailHTML(data);
    const subject = `Neue Klappladen - Anfrage von ${data.customerName} `;

    // Create transporter and send email
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Blank Konfigurator" < ${GMAIL_USER}> `,
      to: RECIPIENT_EMAIL,
      replyTo: data.customerEmail,
      subject: subject,
      html: emailHTML,
    });

    console.log('Email sent successfully to:', RECIPIENT_EMAIL);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send email' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

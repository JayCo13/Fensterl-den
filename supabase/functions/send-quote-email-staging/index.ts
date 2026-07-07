// ⚠️ STAGING/TEST COPY of send-quote-email — for Tai + Britta to test on the Netlify
// preview before it goes live. Differences vs. prod: back-office goes to
// STAGING_RECIPIENT_EMAIL and the Markus cc is redirected to STAGING_CC_EMAIL (a tester
// playing Markus, not the real markus@blank.at); back-office subject is prefixed "[TEST]".
// Role-play: STAGING_RECIPIENT_EMAIL = back-office (to), STAGING_CC_EMAIL = Markus (cc).
// Sends via Resend (same RESEND_API_KEY / RESEND_FROM as prod). Delete once promoted.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Resend configuration (shared project key) + STAGING recipients.
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const FROM_EMAIL = Deno.env.get('RESEND_FROM') || 'Blank <info@blank.at>';
const RECIPIENT_EMAIL = Deno.env.get('STAGING_RECIPIENT_EMAIL') || Deno.env.get('RECIPIENT_EMAIL') || '';
// Stands in for markus@blank.at during testing (e.g. Britta). Cc is skipped if unset.
const CC_EMAIL = Deno.env.get('STAGING_CC_EMAIL') || '';

interface FileAttachment {
  name: string;
  type: string;
  data: string; // base64
}

interface QuoteRequest {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  customerStreet?: string;
  customerCountry?: string;
  customerZip?: string;
  customerCity?: string;
  customerCompany?: string;
  shutterType: string;
  material: string;
  designName: string;
  woodType?: string;
  ausstellerEnabled?: boolean;
  kombinationEnabled?: boolean;
  kombinationDesign1?: string;
  kombinationDesign2?: string;
  kombinationAufteilung?: string;
  ausnehmungEnabled?: boolean;
  ausnehmungText?: string;
  colorSystem?: string;
  ralColor: string;
  rohUnbehandelt?: boolean;
  customNcs?: string;
  beschlaegeMode?: string | null;
  beschlaegeColor?: string;
  anschlagsart?: string;
  montagerahmenMaterial?: string;
  einzelteile?: Record<string, number>;
  // Multi-position windows
  windowPositions?: { fluegelOption: string; anzahlFenster: number; width: number; height: number }[];
  // Backward compat flat fields
  width: number;
  height: number;
  fluegelOption?: string;
  anzahlFenster?: number;
  sonderwuensche?: string;
  attachments?: FileAttachment[];
  price?: number | null;
  technicalDetails?: {
    lamellaCount: number;
    spacing: number;
    frameThickness: number;
    totalWidth: number;
    totalHeight: number;
  };
}

function generateEmailHTML(data: QuoteRequest, variant: 'backoffice' | 'customer' = 'backoffice'): string {
  const isCustomer = variant === 'customer';
  const {
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    customerStreet,
    customerCountry,
    customerZip,
    customerCity,
    customerCompany,
    shutterType,
    material,
    designName,
    woodType,
    ausstellerEnabled,
    kombinationEnabled,
    kombinationDesign1,
    kombinationDesign2,
    kombinationAufteilung,
    ausnehmungEnabled,
    ausnehmungText,
    colorSystem,
    ralColor,
    beschlaegeMode,
    beschlaegeColor,
    anschlagsart,
    montagerahmenMaterial,
    einzelteile,
    width,
    height,
    fluegelOption,
    anzahlFenster,
    sonderwuensche,
    attachments,
    technicalDetails,
  } = data;

  const brandColor = '#de2525';

  // Format date
  const now = new Date();
  const dateStr = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  // Build Einzelteile list HTML
  const einzelteileHTML = einzelteile
    ? Object.entries(einzelteile)
      .filter(([, qty]) => qty > 0)
      .map(([name, qty]) => `<div style="font-size: 14px; color: #333; margin-bottom: 4px;">• ${qty}× ${name}</div>`)
      .join('')
    : '';

  // Color system label
  const colorSystemLabel = colorSystem === 'ncs' ? 'NCS'
    : colorSystem === 'lasur' ? 'Lasur'
      : colorSystem === 'roh' ? 'Roh / Unbehandelt'
        : 'RAL';

  // Build the design display — always just show the base design name
  const designDisplay = designName;

  // Show Design-Optionen box only if any option is active
  const hasDesignOptions = kombinationEnabled || ausstellerEnabled || ausnehmungEnabled;

  // Variant-dependent chrome (back-office vs. customer confirmation)
  const headerTitle = isCustomer ? 'Ihre Anfrage' : 'Neue Anfrage';
  const headerMeta = isCustomer
    ? 'Vielen Dank für Ihre Anfrage - wir kümmern uns darum und melden uns in Kürze bei Ihnen.'
    : `Eingegangen am ${dateStr} um ${timeStr} Uhr`;
  const customerInfoHeading = isCustomer ? 'Ihre Angaben' : 'Kundeninformationen';

  // Address for display. When the split fields exist, show each as its own labelled
  // field (Straße / Land / PLZ / Ort — Koram-style, copy-paste ready). Otherwise fall
  // back to the legacy single "Adresse" line from older payloads.
  const hasStructuredAddr = !!(customerStreet || customerCountry || customerZip || customerCity);
  const legacyAddress = customerAddress || '';
  const addressRowsHTML = hasStructuredAddr ? `
              ${customerStreet ? `
              <tr>
                <td colspan="2">
                  <span class="data-label">Straße</span>
                  <div class="data-value" style="font-size: 15px;">${customerStreet}</div>
                </td>
              </tr>` : ''}
              <tr>
                <td colspan="2" style="padding-top: 4px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout: fixed;">
                    <tr>
                      <td style="width: 33%; vertical-align: top; padding-right: 12px;">
                        <span class="data-label">Land</span>
                        <div class="data-value" style="font-size: 15px; margin-bottom: 0;">${customerCountry || '-'}</div>
                      </td>
                      <td style="width: 33%; vertical-align: top; padding-right: 12px;">
                        <span class="data-label">PLZ</span>
                        <div class="data-value" style="font-size: 15px; margin-bottom: 0;">${customerZip || '-'}</div>
                      </td>
                      <td style="width: 34%; vertical-align: top;">
                        <span class="data-label">Ort</span>
                        <div class="data-value" style="font-size: 15px; margin-bottom: 0;">${customerCity || '-'}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>` : (legacyAddress ? `
              <tr>
                <td colspan="2">
                  <span class="data-label">Adresse</span>
                  <div class="data-value" style="font-size: 14px;">${legacyAddress}</div>
                </td>
              </tr>` : '');

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
    .detail-box { background: #f9f9f9; border-radius: 6px; padding: 15px; margin-bottom: 20px; }
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
          <h1>${headerTitle}</h1>
          <div class="header-meta">${headerMeta}</div>
        </td>
      </tr>
      <tr>
        <td class="content-cell">
          
          <!-- Kundendaten -->
          <div class="section">
            <div class="section-heading">${customerInfoHeading}</div>
            <table class="two-col">
              <tr>
                <td>
                  <span class="data-label">Name</span>
                  <div class="data-value">${customerName}</div>
                </td>
                <td>
                  <span class="data-label">E-Mail</span>
                  <div class="data-value">
                    <a href="mailto:${customerEmail}" style="color: #1a1a1a; text-decoration: none; border-bottom: 1px dotted #ccc;">${customerEmail}</a>
                  </div>
                </td>
              </tr>
              ${customerPhone || customerCompany ? `
              <tr>
                ${customerPhone ? `
                <td>
                  <span class="data-label">Telefon</span>
                  <div class="data-value">
                    <a href="tel:${customerPhone}" style="color: #1a1a1a; text-decoration: none; border-bottom: 1px dotted #ccc;">${customerPhone}</a>
                  </div>
                </td>` : '<td></td>'}
                ${customerCompany ? `
                <td>
                  <span class="data-label">Firma</span>
                  <div class="data-value">${customerCompany}</div>
                </td>` : '<td></td>'}
              </tr>` : ''}
              ${addressRowsHTML}
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
                  <span class="data-label">3. Design (Figur)</span>
                  <div class="data-value">${designDisplay}</div>
                </td>
              </tr>
            </table>

            <!-- Design Options — only shown if any option is active -->
            ${hasDesignOptions ? `
            <div class="detail-box">
              <div class="data-label" style="margin-bottom: 10px; color: ${brandColor};">Design-Optionen</div>
              ${kombinationEnabled ? `
              <div style="margin-bottom: 8px;">
                <span style="font-size: 13px; color: #555;">✓ Kombination: ${kombinationDesign1 || '?'} + ${kombinationDesign2 || '?'}</span>
                ${kombinationAufteilung ? `<br><span style="font-size: 13px; color: #555;">Aufteilung: ${kombinationAufteilung}</span>` : ''}
              </div>` : ''}
              ${ausstellerEnabled ? `
              <div style="margin-bottom: 8px;">
                <span style="font-size: 13px; color: #555;">✓ Aussteller aktiviert</span>
              </div>` : ''}
              ${ausnehmungEnabled ? `
              <div style="margin-bottom: 8px;">
                <span style="font-size: 13px; color: #555;">✓ Ausnehmung aktiviert</span>
                ${ausnehmungText ? `<br><span style="font-size: 13px; color: #777; font-style: italic;">Beschreibung: "${ausnehmungText}"</span>` : ''}
              </div>` : ''}
            </div>` : ''}

            <!-- 4. Farbe -->
            <table class="two-col">
              <tr>
                <td>
                  <span class="data-label">4. Farbsystem</span>
                  <div class="data-value">${colorSystemLabel}</div>
                </td>
                <td>
                  <span class="data-label">Farbwahl</span>
                  <div class="data-value">${ralColor}</div>
                </td>
              </tr>
            </table>

            <!-- 5. Beschläge -->
            ${beschlaegeMode === 'anschlagsart' ? `
            <div class="detail-box">
              <div class="data-label" style="margin-bottom: 10px; color: ${brandColor};">5. Beschläge — Anschlagsart</div>
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
                ${montagerahmenMaterial ? `
                <tr>
                  <td colspan="2">
                    <span class="data-label">Montagerahmen</span>
                    <div class="data-value" style="font-size: 15px;">${montagerahmenMaterial === 'aluminium' ? 'Aluminium' : montagerahmenMaterial === 'holz' ? 'Holz' : montagerahmenMaterial}</div>
                  </td>
                </tr>` : ''}
              </table>
            </div>
            ` : beschlaegeMode === 'einzelteile' ? `
            <div class="detail-box">
              <div class="data-label" style="margin-bottom: 10px; color: ${brandColor};">5. Beschläge — Einzelteile</div>
              ${einzelteileHTML || '<div style="font-size: 14px; color: #999;">Keine Teile ausgewählt</div>'}
              ${beschlaegeColor ? `
              <div style="margin-top: 10px;">
                <span class="data-label">Beschläge Farbe</span>
                <div class="data-value" style="font-size: 15px;">${beschlaegeColor}</div>
              </div>` : ''}
            </div>
            ` : `
            <table class="two-col">
              <tr>
                <td>
                  <span class="data-label">5. Beschläge</span>
                  <div class="data-value" style="color: #999;">${beschlaegeMode === 'none' ? 'Keine Beschläge gewünscht' : 'Nicht ausgewählt'}</div>
                </td>
              </tr>
            </table>
            `}

            <!-- Abmessungen -->
            <div class="section-heading" style="margin-top: 30px;">Abmessungen</div>
            ${data.windowPositions && data.windowPositions.length > 0 ? `
            ${data.windowPositions.map((pos: { fluegelOption: string; anzahlFenster: number; width: number; height: number }, idx: number) => `
            <div class="detail-box" style="margin-bottom: 15px;">
              <div class="data-label" style="margin-bottom: 8px; color: ${brandColor};">${data.windowPositions!.length > 1 ? `Position ${idx + 1}` : 'Fenster'}</div>
              <table class="two-col">
                <tr>
                  <td>
                    <span class="data-label">Fenstermaße (B x H)</span>
                    <div class="data-value" style="font-size: 15px;">${pos.width} x ${pos.height} mm</div>
                  </td>
                  <td>
                    <span class="data-label">Anzahl Fenster</span>
                    <div class="data-value" style="font-size: 15px;">${pos.anzahlFenster || 1} Stück</div>
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                     <span class="data-label">Flügelanordnung</span>
                     <div class="data-value" style="margin-bottom: 0; font-size: 15px;">${pos.fluegelOption || '-'}</div>
                  </td>
                </tr>
              </table>
            </div>
            `).join('')}
            ` : `
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
                   <div class="data-value" style="margin-bottom: 0;">${fluegelOption || '-'}</div>
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
            `}
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

          ${attachments && attachments.length > 0 ? `
          <div class="section">
            <div class="section-heading">Anhänge</div>
            <div style="font-size: 14px; color: #555;">
              ${attachments.map((f: FileAttachment) => `<div style="margin-bottom: 4px;">📎 ${f.name}</div>`).join('')}
            </div>
          </div>
          ` : ''}

        </td>
      </tr>
    </table>
    
    <div class="footer">
      ${isCustomer ? `
      <p style="margin: 0 0 14px; line-height: 1.5;">Sie erhalten diese Mail, da Sie einen individuellen Fensterladen konfiguriert und dafür ein unverbindliches Angebot angefragt haben.</p>
      <p style="margin: 0; color: #555; font-weight: 600;">A. BLANK GmbH &amp; Co. KG</p>
      <p style="margin: 2px 0 0; color: #777;">Schützengartenstraße 20</p>
      <p style="margin: 2px 0 0; color: #777;">6890 Lustenau, Vorarlberg, Österreich</p>
      <p style="margin: 6px 0 0; color: #777;">+43 5577 85944-0 &middot; <a href="mailto:info@blank.at" style="color: #777; text-decoration: none;">info@blank.at</a></p>
      ` : `
      <p>System-Nachricht generiert vom Blank Klappladen-Konfigurator</p>
      `}
      <p style="margin-top: 10px; opacity: 0.5;">© ${new Date().getFullYear()} Blank</p>
    </div>
  </div>
</body>
</html>
  `;
}

interface SendArgs {
  to: string;
  cc?: string;
  replyTo?: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
}

// Send one email via the Resend API. Throws on a non-2xx response so callers can handle it.
async function sendViaResend({ to, cc, replyTo, subject, html, attachments }: SendArgs) {
  const payload: Record<string, unknown> = {
    from: FROM_EMAIL,
    to: [to],
    subject,
    html,
  };
  if (cc) payload.cc = [cc];
  if (replyTo) payload.reply_to = replyTo;
  if (attachments && attachments.length > 0) payload.attachments = attachments;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Resend API error ${res.status}: ${await res.text()}`);
  }
  return await res.json();
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

    // Check Resend configuration
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build attachments (base64) from the uploaded files
    const mailAttachments = data.attachments?.map((file) => ({
      filename: file.name,
      content: file.data,
    })) || [];

    // 1. Back-office email (internal — unchanged wording, with attachments)
    // STAGING role-play: to = tester as back-office, cc = tester as Markus (STAGING_CC_EMAIL,
    // not the real markus@blank.at). [TEST] subject prefix so it can't be confused with a real lead.
    await sendViaResend({
      to: RECIPIENT_EMAIL,
      cc: CC_EMAIL || undefined,
      replyTo: data.customerEmail,
      subject: `[TEST] Neue Klappladen - Anfrage von ${data.customerName}`,
      html: generateEmailHTML(data, 'backoffice'),
      attachments: mailAttachments,
    });

    console.log('Back-office email sent successfully to:', RECIPIENT_EMAIL);

    // 2. Customer confirmation email (best-effort — must NOT fail the request if it errors)
    try {
      await sendViaResend({
        to: data.customerEmail,
        replyTo: RECIPIENT_EMAIL,
        subject: 'Vielen Dank für Ihre Anfrage',
        html: generateEmailHTML(data, 'customer'),
      });
      console.log('Customer confirmation email sent to:', data.customerEmail);
    } catch (customerMailError) {
      console.error('Failed to send customer confirmation email:', customerMailError);
    }

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

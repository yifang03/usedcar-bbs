import nodemailer from "nodemailer";

interface VerificationEmailParams {
  to: string;
  recipientName: string;
  code: string;
  expiresInMinutes: number;
}

const siteName = process.env.SITE_NAME || "一方二手车论坛";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || (user ? `${siteName} <${user}>` : "");

  if (!host || !user || !pass || !from) {
    throw new Error("SMTP configuration is incomplete");
  }

  return { host, port, user, pass, from };
}

function verificationTemplate({ recipientName, code, expiresInMinutes }: Omit<VerificationEmailParams, "to">) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 24px; background: #f5f7fa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", Arial, sans-serif; color: #172033; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 28px rgba(23, 32, 51, 0.10); border: 1px solid #e1e7ef; }
    .header { background: #1f6feb; color: #ffffff; padding: 28px 32px; }
    .brand { font-size: 22px; font-weight: 800; margin: 0; }
    .slogan { margin-top: 6px; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px; font-size: 15px; line-height: 1.8; }
    .code { margin: 22px 0; padding: 18px 20px; background: #e8f1ff; color: #1f6feb; border-radius: 12px; text-align: center; font-size: 34px; font-weight: 800; letter-spacing: 8px; }
    .muted { color: #697386; font-size: 13px; }
    .footer { padding: 18px 32px; background: #f8fafc; color: #8a94a6; font-size: 12px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p class="brand">${siteName}</p>
      <div class="slogan">懂车友，少走弯路</div>
    </div>
    <div class="content">
      <p>${recipientName || "车友"}，您好：</p>
      <p>您正在进行邮箱验证，本次验证码为：</p>
      <div class="code">${code}</div>
      <p>验证码将在 <strong>${expiresInMinutes}</strong> 分钟后失效，请尽快完成验证。</p>
      <p class="muted">如果不是您本人操作，请忽略此邮件。为了账号安全，请不要把验证码告诉他人。</p>
    </div>
    <div class="footer">
      此邮件由 ${siteName} 自动发送，请勿直接回复。<br />
      ${siteName} · 二手车买卖、问答和经验分享社区
    </div>
  </div>
</body>
</html>`;
}

export async function sendVerificationEmail(params: VerificationEmailParams) {
  const config = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: params.to,
    subject: `${siteName}邮箱验证码`,
    html: verificationTemplate(params),
  });
}

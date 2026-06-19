"""
Email utility using Python's built-in smtplib.
Supports Gmail, Outlook, and any SMTP provider.
Configure via environment variables — no extra packages needed.
"""
import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


def _get_smtp_config():
    """Read SMTP settings from environment."""
    return {
        'host':     os.environ.get('MAIL_SERVER',   'smtp.gmail.com'),
        'port':     int(os.environ.get('MAIL_PORT', 587)),
        'username': os.environ.get('MAIL_USERNAME', ''),
        'password': os.environ.get('MAIL_PASSWORD', ''),
        'use_tls':  os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true',
        'sender':   os.environ.get('MAIL_SENDER',   os.environ.get('MAIL_USERNAME', '')),
        'name':     os.environ.get('MAIL_SENDER_NAME', 'NetZone Cyber Café'),
    }


def send_email(to_email: str, subject: str, html_body: str, text_body: str = '') -> bool:
    """
    Send an email via SMTP.
    Returns True on success, False on failure.
    In development mode (MAIL_USERNAME not set), prints to console instead.
    """
    cfg = _get_smtp_config()
    # Development fallback: print to console if SMTP not configured
    if not cfg['username'] or not cfg['password']:
        logger.warning('SMTP not configured — printing email to console')
        print('\n' + '='*60)
        print(f'[DEV EMAIL] To: {to_email}')
        print(f'[DEV EMAIL] Subject: {subject}')
        print(f'[DEV EMAIL] Body: {text_body or html_body}')
        print('='*60 + '\n')
        print('*'*60 + '\n')
        return True

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From']    = f'{cfg["name"]} <{cfg["sender"]}>'
        msg['To']      = to_email

        if text_body:
            msg.attach(MIMEText(text_body, 'plain'))
        msg.attach(MIMEText(html_body, 'html'))

        with smtplib.SMTP(cfg['host'], cfg['port']) as server:
            server.ehlo()
            if cfg['use_tls']:
                server.starttls()
                server.ehlo()
            server.login(cfg['username'], cfg['password'])
            server.sendmail(cfg['sender'], to_email, msg.as_string())

        logger.info(f'Email sent to {to_email}: {subject}')
        return True

    except smtplib.SMTPAuthenticationError:
        logger.error('SMTP authentication failed — check MAIL_USERNAME and MAIL_PASSWORD')
        return False
    except smtplib.SMTPException as e:
        logger.error(f'SMTP error sending to {to_email}: {e}')
        return False
    except Exception as e:
        logger.error(f'Unexpected error sending email to {to_email}: {e}')
        return False


def send_otp_email(to_email: str, otp_code: str, full_name: str = '') -> bool:
    """
    Send a password-reset OTP email with a professional HTML template.
    """
    name_greeting = f'Hi {full_name},' if full_name else 'Hello,'

    html_body = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset OTP</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0c4a6e,#0369a1);padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;">
                🖥️ NetZone Cyber Café
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:#bae6fd;">Password Reset Request</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:15px;color:#334155;">{name_greeting}</p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                We received a request to reset your password.
                Use the OTP below to proceed. This code is valid for <strong>10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#f0f9ff;border:2px dashed #0284c7;border-radius:12px;padding:24px;text-align:center;margin:0 0 28px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#0369a1;text-transform:uppercase;letter-spacing:1px;">
                  Your One-Time Password
                </p>
                <p style="margin:0;font-size:42px;font-weight:900;color:#0c4a6e;letter-spacing:10px;font-family:'Courier New',monospace;">
                  {otp_code}
                </p>
              </div>

              <!-- Warning -->
              <div style="background:#fef9c3;border-left:4px solid #ca8a04;border-radius:8px;padding:14px 16px;margin:0 0 24px;">
                <p style="margin:0;font-size:13px;color:#713f12;line-height:1.5;">
                  ⚠️ <strong>Never share this OTP</strong> with anyone — including our staff.
                  If you didn't request a password reset, please ignore this email.
                  Your account remains secure.
                </p>
              </div>

              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                This OTP will expire in <strong>10 minutes</strong>.
                After that, you'll need to request a new one.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © 2025 NetZone Cyber Café · This is an automated email, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    text_body = (
        f"{name_greeting}\n\n"
        f"Your password reset OTP is: {otp_code}\n\n"
        f"This code is valid for 10 minutes.\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"— NetZone Cyber Café"
    )

    return send_email(
        to_email  = to_email,
        subject   = f'Your Password Reset OTP — {otp_code}',
        html_body = html_body,
        text_body = text_body,
    )

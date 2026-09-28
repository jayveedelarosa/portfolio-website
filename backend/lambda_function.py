import json
import os
import re

import boto3

ses = boto3.client('ses')

EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

ALLOWED_ORIGIN = os.environ.get('ALLOWED_ORIGIN', 'https://jayveedelarosa.dev')


def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body') or '{}')
    except (json.JSONDecodeError, TypeError):
        return _response(400, {'success': False, 'error': 'Malformed request body.'})

    # Honeypot check — real visitors never fill this in.
    if (body.get('website') or '').strip():
        return _response(200, {'success': True})

    name = (body.get('name') or '').strip()
    email = (body.get('email') or '').strip()
    message = (body.get('message') or '').strip()

    # Same limits as the website's client-side validation — enforced again
    # here because anyone can call this API directly, bypassing the browser.
    if not (2 <= len(name) <= 50) or '\n' in name or '\r' in name:
        return _response(400, {'success': False, 'error': 'Name must be 2-50 characters.'})
    if len(email) > 254 or not EMAIL_RE.match(email):
        return _response(400, {'success': False, 'error': 'Please provide a valid email address.'})
    if not (20 <= len(message) <= 2000):
        return _response(400, {'success': False, 'error': 'Message must be 20-2000 characters.'})

    try:
        ses.send_email(
            Source=os.environ['SENDER_ADDRESS'],
            Destination={'ToAddresses': [os.environ['RECIPIENT_ADDRESS']]},
            ReplyToAddresses=[email],
            Message={
                'Subject': {'Data': f'Portfolio contact form - {name}'[:200]},
                'Body': {'Text': {'Data': f'Name: {name}\nEmail: {email}\n\n{message}'}},
            },
        )
    except ses.exceptions.MessageRejected:
        return _response(502, {'success': False, 'error': 'Email could not be sent. Please try again later.'})
    except Exception:
        return _response(500, {'success': False, 'error': 'Unexpected server error.'})

    return _response(200, {'success': True})


def _response(status, payload):
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        },
        'body': json.dumps(payload),
    }

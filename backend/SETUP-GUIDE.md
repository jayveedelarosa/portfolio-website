# Contact Form Backend — AWS Setup Guide

This guide walks you through building the "backend" for your contact form:
the part of AWS that actually takes the message and emails it to your Gmail.

You don't need to know AWS already — every term is explained the first time
it's used. Do these steps **in order**, in the **ap-southeast-1 (Singapore)**
region (so everything lives in the same place — pick this region in the
top-right corner of the AWS Console before you start each step).

## The big picture

```
Your website (browser)
   │  sends the form data
   ▼
API Gateway   ──  a public web address that accepts the form data
   │
   ▼
Lambda        ──  a small program (backend/lambda_function.py) that checks
   │              the data and decides whether to send an email
   ▼
SES           ──  AWS's email-sending service
   │
   ▼
Your Gmail inbox
```

You'll set these up in this order: **SES → IAM → Lambda → API Gateway**, then
test everything together.

> **Starting fresh?** `script.js` currently has an old address
> (`wvj6qecu19.execute-api.ap-southeast-1.amazonaws.com/contact`) left over from
> before, but that AWS API has been deleted — so that address no longer works.
> You're building everything from scratch, which means following **every step
> below, in order, from Step 1**. At the end (Step 5), you'll replace that old,
> dead address in `script.js` with the brand-new one you create in Step 4.
>
> One thing that *might* already exist from before: your Gmail address may
> already show as "Verified" in SES (Step 1.2). If so, great — just skip that
> one checkbox and move on. Everything else (Lambda, permissions, API Gateway)
> needs to be created new.

---

## Step 1 — SES (the email sender)

**SES (Simple Email Service)** is the AWS service that actually sends the
email. Before it'll send anything, you have to prove you own the email
addresses involved.

### 1.1 Open SES
In the AWS Console search bar, type **"SES"** and open it. Make sure the
region (top-right) is **Asia Pacific (Singapore) ap-southeast-1**.

### 1.2 Verify your Gmail address (the one that receives messages)
1. In the left sidebar, click **Verified identities**.
2. Click **Create identity**.
3. Choose **Email address**, enter your Gmail address
   (`jayveecalozadelarosa@gmail.com`), and click **Create identity**.
4. AWS sends a verification email to that address — open it and click the
   confirmation link.

### 1.3 Choose your "from" address — pick one:

**Option A — Quickest (recommended to get started):**
Use your already-verified Gmail address as the "from" address too. Since
both the sender and recipient are the same verified address, this works
immediately — no extra setup, and you can fully test everything today.

**Option B — More polished (optional, do this later):**
Verify your domain (`jayveedelarosa.dev`) instead, so emails come from
something like `noreply@jayveedelarosa.dev`.
1. In **Verified identities**, click **Create identity** → choose **Domain**
   → enter `jayveedelarosa.dev`.
2. AWS gives you a few DNS records (for DKIM — this proves to email
   providers that the message really came from you, not a spammer).
3. Add those records to your domain's DNS in **Porkbun** (Porkbun → your
   domain → DNS records → add each record AWS shows you, exactly as given).
4. Wait for AWS to show the domain as "Verified" (can take a few minutes to
   a few hours).

You can start with Option A today and switch to Option B later — you'll just
update one environment variable in Step 3.4 when you do.

### 1.4 About "Sandbox mode"
New SES accounts start in **sandbox mode**, which only allows sending
to/from **verified** addresses. Since your "from" and "to" addresses in
Option A are both your own verified Gmail, **sandbox mode is totally fine for
this project** — you don't need to request "production access" unless you
later want to send to many different recipients.

---

## Step 2 — IAM Role (the permission slip)

**IAM (Identity and Access Management)** controls what each AWS service is
*allowed* to do. We'll give the Lambda function a permission slip that says
"you may send emails via SES, and nothing else." This way, if anything ever
goes wrong with the function, the damage is limited.

You'll actually create this role *while creating the Lambda function* in
Step 3 — AWS creates a basic role automatically, and we'll add one extra
permission to it. Just keep this concept in mind; the concrete steps are
below.

---

## Step 3 — Lambda (the function that decides what to do)

**Lambda** lets you run a small piece of code (in our case, Python) without
managing a server. AWS runs it only when needed — when your contact form is
submitted.

### 3.1 Create the function
1. In the AWS Console, search for **"Lambda"** and open it.
2. Click **Create function**.
3. Choose **Author from scratch**.
4. **Function name**: `contact-form-handler`
5. **Runtime**: choose the latest **Python** version (e.g. Python 3.12).
6. Leave everything else as default, click **Create function**.

### 3.2 Paste in the code
1. On the function's page, scroll to the **Code** section.
2. Open the file `lambda_function.py` in the built-in editor (it should
   already be open by default).
3. Delete everything in it, and paste in the entire contents of this
   repo's **`backend/lambda_function.py`** file.
4. Click **Deploy** (top of the code editor) to save it.

### 3.3 Give it permission to send email (finish Step 2)
1. On the function's page, click the **Configuration** tab → **Permissions**
   in the left sub-menu.
2. Click the **Role name** link (opens IAM in a new tab).
3. Click **Add permissions** → **Create inline policy**.
4. Switch to the **JSON** tab and paste this in:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["ses:SendEmail", "ses:SendRawEmail"],
         "Resource": "*"
       }
     ]
   }
   ```
   *(`Resource: "*"` keeps this simple for now — it's still scoped to
   SES-sending only, which is the important part.)*
5. Click **Next**, give it a name like `allow-ses-send`, and click
   **Create policy**.

### 3.4 Set environment variables
Back on the Lambda function page → **Configuration** tab → **Environment
variables** → **Edit** → **Add environment variable**, add these three:

| Key | Value |
|---|---|
| `SENDER_ADDRESS` | `jayveecalozadelarosa@gmail.com` (or your verified domain address from Step 1.3 Option B) |
| `RECIPIENT_ADDRESS` | `jayveecalozadelarosa@gmail.com` |
| `ALLOWED_ORIGIN` | `https://jayveedelarosa.dev` |

Click **Save**.

### 3.5 Test it directly (before connecting it to the website)
1. Click the **Test** tab.
2. Create a new test event, and replace the sample JSON with:
   ```json
   {
     "body": "{\"name\": \"Test User\", \"email\": \"test@example.com\", \"message\": \"This is a test message with more than twenty characters.\", \"website\": \"\"}"
   }
   ```
3. Click **Test**. You should see a result like:
   ```json
   {"statusCode": 200, "headers": {...}, "body": "{\"success\": true}"}
   ```
4. Check the inbox of `RECIPIENT_ADDRESS` — you should receive a test email
   within a minute or two.

If you get an error instead, see **Troubleshooting** at the bottom before
moving on.

---

## Step 4 — API Gateway (the public doorway)

Right now, the Lambda function can only be triggered manually from the AWS
Console. **API Gateway** gives it a public web address that your website's
JavaScript can call with `fetch()`.

### 4.1 Create the API
1. Search for **"API Gateway"** and open it.
2. Click **Create API**.
3. Find **HTTP API** (not "REST API" — HTTP API is simpler and cheaper) and
   click **Build**.
4. Click **Add integration** → choose **Lambda** → select your
   `contact-form-handler` function.
5. **API name**: `contact-form-api`. Click **Next**.

### 4.2 Add the route
1. You'll see a route configuration screen. Set:
   - **Method**: `POST`
   - **Resource path**: `/contact`
   - **Integration target**: your Lambda function (should already be filled in)
2. Click **Next**.

### 4.3 Configure CORS (only your website can call this)
**CORS (Cross-Origin Resource Sharing)** controls which websites are allowed
to call this API from a browser. Without it, *any* website could use your
API to send emails through your account.

On the "Configure CORS" screen (or later via **your API → CORS** in the left
sidebar):
- **Access-Control-Allow-Origin**: `https://jayveedelarosa.dev`
- **Access-Control-Allow-Methods**: `POST`
- **Access-Control-Allow-Headers**: `content-type`

Click **Next**, then **Create**.

### 4.4 Turn on rate limiting (slow down bots)
1. In your API's left sidebar, click **Stages** → click the stage name
   (usually `$default`).
2. Click **Edit**, scroll to **Throttling**, and set:
   - **Rate**: `5` (requests per second)
   - **Burst**: `10`
3. Save.

This means even if a bot calls your API directly (skipping the website and
its honeypot), API Gateway will start rejecting requests after a handful per
second — your real visitors will never notice this limit.

### 4.5 Find your API's URL
1. In the left sidebar, click **Stages** → click `$default`.
2. Copy the **Invoke URL** shown at the top (looks like
   `https://abcd1234.execute-api.ap-southeast-1.amazonaws.com`).
3. Your full contact endpoint is that URL **+ `/contact`**, e.g.:
   ```
   https://abcd1234.execute-api.ap-southeast-1.amazonaws.com/contact
   ```

---

## Step 5 — Connect it to your website

1. Open `script.js` in this repo and find this line (around line 294):
   ```js
   const API_ENDPOINT = 'https://wvj6qecu19.execute-api.ap-southeast-1.amazonaws.com/contact';
   ```
2. Replace the URL with **your** new Invoke URL + `/contact` from Step 4.5
   (skip this if you reused your existing API in Step 4).
3. Save, then deploy your site as usual (or test locally first — see below).

### Test end-to-end
1. Run the site locally (`npx serve .` from the project folder, then open
   the printed `http://localhost:...` address), or open your live site.
2. Fill out the contact form with real-looking info and submit it.
3. You should see the green "Message sent!" confirmation.
4. Check your Gmail inbox — the email should arrive within a minute, with
   **Reply-To** set to whatever email you typed in the form (try hitting
   Reply to confirm).

---

## Step 6 — Security & Spam Checklist

Here's everything now protecting your form, and what each layer catches:

| Layer | What it stops |
|---|---|
| **Honeypot field** (website code) | Simple bots that auto-fill every field |
| **Client-side validation** (website code) | Accidental bad input, gives instant feedback |
| **Server-side validation** (Lambda) | Anyone calling the API directly with bad/oversized data |
| **CORS restricted to your domain** (API Gateway) | Other websites using your API as a free mailer |
| **Rate limiting** (API Gateway) | Bots hammering the endpoint repeatedly |
| **IAM least-privilege role** (Lambda) | Limits the blast radius if anything is ever compromised |
| **Reply-To header** (Lambda) | Lets you reply directly to visitors without exposing your "from" address as the contact |

### Optional extras (only if spam becomes a real problem later)
- **AWS WAF** — a paid (~$5-6/month) firewall you can attach to API Gateway
  for per-visitor rate limits based on IP address. Most personal sites never
  need this.
- **CAPTCHA** (e.g. Cloudflare Turnstile) — adds a small challenge before
  submission. Adds friction for real users, so only add it if the honeypot +
  rate limiting aren't enough.
- **SES bounce/complaint alerts** — set up an SNS (notification) topic so
  AWS emails *you* if something looks wrong with your sending reputation.

---

## Troubleshooting

**"Email address is not verified" error from SES**
→ Go back to Step 1.2/1.3 — both `SENDER_ADDRESS` and `RECIPIENT_ADDRESS`
must be verified identities in SES while in sandbox mode.

**Browser console shows a CORS error**
→ Double-check Step 4.3 — `Access-Control-Allow-Origin` must exactly match
your site's address, including `https://` and no trailing slash.

**Browser console shows a Content-Security-Policy error blocking the
request**
→ The website's `index.html` has a CSP that only allows talking to one
specific API address. If you created a *new* API Gateway with a different
URL, update the `connect-src` and `form-action` parts of the
`Content-Security-Policy` `<meta>` tag in `index.html` to match your new URL
(same place you updated `API_ENDPOINT` in Step 5).

**Form shows "Something went wrong" / Network error**
→ Open DevTools → Network tab, click the failed `/contact` request, and
check the **Response** — Lambda's error messages are designed to tell you
exactly what's wrong (e.g. "Message must be 20-2000 characters").

**No email arrives, but the website shows success**
→ Check the Lambda function's **Monitor** tab → **View CloudWatch logs** for
errors from the SES call. Also check your Gmail Spam folder.

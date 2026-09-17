# Raise – install page

A one-page site that installs the Raise build on a registered iPhone, over
the air, with one tap. Deploy it on Vercel; nothing to configure.

## Deploy

1. Push this folder to a GitHub repository (the whole folder is the site).
2. In Vercel: **Add New → Project → Import** that repository. Framework
   preset: **Other**. Leave build settings empty. Deploy.
3. Open the Vercel URL in **Safari on the iPhone** and tap **Download Raise**.
   iOS asks to install; the icon appears on the home screen.
4. First launch: if iOS says the developer is untrusted, go to Settings →
   General → VPN & Device Management → trust the developer, then open Raise.

## How it works

* `Raise.ipa` is the signed build. It only installs on iPhones that are in
  its provisioning profile (registered in the Apple Developer account).
* `api/manifest.js` is a tiny serverless function that returns the OTA
  manifest iOS needs, with the IPA URL built from the current domain, so it
  works on any Vercel URL or custom domain.
* `index.html` has the button (an `itms-services://` link to that manifest).

## New build

In the app project run `tools/make_ipa.sh`; it builds Release for the
device, packages `Raise.ipa` into this folder, and you push + Vercel
redeploys. The IPA is ~28 MB (the app's images are compressed for device
builds); each new build adds another copy to the repository's history.

// The OTA install manifest, built for whatever domain this is deployed on,
// so the IPA URL is always right. iOS fetches it from the itms-services link.
module.exports = (req, res) => {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const base = `https://${host}`;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>items</key>
  <array>
    <dict>
      <key>assets</key>
      <array>
        <dict>
          <key>kind</key><string>software-package</string>
          <key>url</key><string>${base}/Raise.ipa</string>
        </dict>
        <dict>
          <key>kind</key><string>display-image</string>
          <key>url</key><string>${base}/img/icon-57.png</string>
        </dict>
        <dict>
          <key>kind</key><string>full-size-image</string>
          <key>url</key><string>${base}/img/icon-512.png</string>
        </dict>
      </array>
      <key>metadata</key>
      <dict>
        <key>bundle-identifier</key><string>app.tryraise.Raise</string>
        <key>bundle-version</key><string>1.0</string>
        <key>kind</key><string>software</string>
        <key>title</key><string>Raise</string>
      </dict>
    </dict>
  </array>
</dict>
</plist>`;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(xml);
};

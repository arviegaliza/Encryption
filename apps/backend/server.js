const express = require('express');
const multer = require('multer');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const port = 3002;
const SECRET_KEY = 'your-secret-key';

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Helper: get local IP address for LAN QR code access
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  if (!interfaces) return 'localhost';

  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  const { username, expiryMinutes } = req.body;
  const filePath = req.file.path;

  // Create JWT token with file info and expiry
  const token = jwt.sign(
    {
      username,
      filePath,
      originalName: req.file.originalname, // Keep original file name
      exp: Math.floor(Date.now() / 1000) + expiryMinutes * 60,
    },
    SECRET_KEY
  );

  const ip = getLocalIPAddress();
  const downloadUrl = `http://${ip}:${port}/download/${token}`;

  QRCode.toDataURL(downloadUrl, (err, qrCodeUrl) => {
    if (err) {
      console.error('QR code generation failed:', err);
      return res.status(500).send('QR generation failed');
    }
    res.json({ qrCodeUrl, downloadUrl });
  });
});

// Download endpoint
app.get('/download/:token', (req, res) => {
  const { token } = req.params;

  try {
    const payload = jwt.verify(token, SECRET_KEY);
    const filePath = payload.filePath;
    const originalName = payload.originalName || path.basename(filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('File not found');
    }

    // Send file with original filename for proper download
    res.download(filePath, originalName, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).send('Error sending file');
      }
    });
  } catch (err) {
    console.error('Invalid or expired token:', err);
    res.status(403).send('Access denied or token expired');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend running on all network interfaces at port ${port}`);
});

app.get('/', (req, res) => {
  res.send('Server is up!');
});

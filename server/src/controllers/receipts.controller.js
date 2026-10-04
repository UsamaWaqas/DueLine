const Tesseract = require('tesseract.js');
const { parseReceiptText } = require('../utils/ocrParse');

async function scan(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'image file is required (field name: image)' });
  }

  const { data } = await Tesseract.recognize(req.file.buffer, 'eng');
  const result = parseReceiptText(data.text || '');
  res.json(result);
}

module.exports = { scan };

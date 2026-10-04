const express = require('express');
const multer = require('multer');
const { scan } = require('../controllers/receipts.controller');
const { requireAuth } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();

router.post('/scan', requireAuth, upload.single('image'), scan);

module.exports = router;

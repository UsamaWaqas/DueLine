const express = require('express');
const { getSync, putSync } = require('../controllers/sync.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, getSync);
router.put('/', requireAuth, putSync);

module.exports = router;

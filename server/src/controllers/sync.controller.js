const SyncData = require('../models/SyncData');

async function getSync(req, res) {
  const doc = await SyncData.findOne({ userId: req.userId });
  if (!doc) {
    return res.json({ payload: null, updatedAt: null });
  }
  res.json({ payload: doc.payload, updatedAt: doc.updatedAt });
}

async function putSync(req, res) {
  const { payload } = req.body || {};
  if (typeof payload !== 'object' || payload === null) {
    return res.status(400).json({ error: 'payload must be an object' });
  }

  // Last-write-wins: whichever device pushes most recently fully replaces the stored blob.
  const doc = await SyncData.findOneAndUpdate(
    { userId: req.userId },
    { payload },
    { upsert: true, new: true },
  );
  res.json({ payload: doc.payload, updatedAt: doc.updatedAt });
}

module.exports = { getSync, putSync };

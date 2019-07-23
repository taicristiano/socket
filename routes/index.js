/**
 * This module connects rendering modules to routes
 */

const express = require('express');
const router = express.Router();

const messageCtrl = require('./../controllers/NotificationController');

// post notification
router.post('/notification', messageCtrl.notification)

module.exports = router;
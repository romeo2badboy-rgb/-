const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/dashboard', reportController.getDashboardStats);
router.get('/sales', reportController.getSalesReport);
router.get('/inventory', reportController.getInventoryReport);
router.get('/customers', reportController.getCustomerReport);
router.get('/profit', reportController.getProfitReport);

module.exports = router;

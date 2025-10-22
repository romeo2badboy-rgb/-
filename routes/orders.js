const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAllOrders);
router.get('/statistics', orderController.getStatistics);
router.get('/customer/:customerId', orderController.getOrdersByCustomer);
router.get('/:id', orderController.getOrderById);
router.post('/', orderController.createOrder);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/payment-status', orderController.updatePaymentStatus);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;

const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.get('/', invoiceController.getAllInvoices);
router.get('/customer/:customerId', invoiceController.getInvoicesByCustomer);
router.get('/:id', invoiceController.getInvoiceById);
router.post('/', invoiceController.createInvoice);
router.put('/:id/status', invoiceController.updateInvoiceStatus);
router.post('/:id/payments', invoiceController.addPayment);
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;

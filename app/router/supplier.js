const express = require('express');
const router = express.Router();
const {
    GettingSupplierByProductGorup
} = require('../controller/supplier-controller');

/**
 * @swagger
 * tags:
 *   name: SupplierApp
 *   description: This Tag use for Supplier in the application.
 */

/**
* @swagger
* /api/app/suppliermanagement/supplier/{pgroupId}:
*   get:
*     tags: [SupplierApp]
*     summary: getting supplier By product group
*     parameters:
*       - in: path
*         name: pgroupId
*         required: true
*         description: The ID of the Model to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: getting supplier By product group successfully
*/
router.get('/supplier/:pgroupId', GettingSupplierByProductGorup);

module.exports = router;
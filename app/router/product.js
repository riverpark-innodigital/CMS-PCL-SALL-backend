const express = require('express');
const router = express.Router();
const {
    GettingProductBySup,
    GettingProductById
} = require('../controller/product-controller');

/**
 * @swagger
 * tags:
 *   name: ProductApp
 *   description: This Tag use for Supplier in the application.
 */

/**
* @swagger
* /api/app/productmanagement/product/{supId}/{pgid}:
*   get:
*     tags: [ProductApp]
*     summary: getting product suplier
*     parameters:
*       - in: path
*         name: supId
*         required: true
*         description: The ID of the Model to getting
*         schema:
*           type: string
*       - in: path
*         name: pgid
*         required: true
*         description: The ID of the Model to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: getting product suplier successfully
*/
router.get('/product/:supId/:pgid', GettingProductBySup);

/**
* @swagger
* /api/app/productmanagement/productdetail/{supId}/{productId}:
*   get:
*     tags: [ProductApp]
*     summary: getting product
*     parameters:
*       - in: path
*         name: supId
*         required: true
*         description: The ID of the Model to getting
*         schema:
*           type: string
*       - in: path
*         name: productId
*         required: true
*         description: The ID of the Model to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: getting product successfully
*/
router.get('/productdetail/:supId/:productId', GettingProductById);

module.exports = router;
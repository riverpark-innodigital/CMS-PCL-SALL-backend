const express = require('express');
const router = express.Router();
const {
    addNewPresentKPI,
    getQtyProdcutPresentKPIBySale,
    getQtyProdcutPresentKPIBySaleTop,
    getTopSupplierForPresentKpi,
} = require('../controller/presentation-controller');

/**
 * @swagger
 * tags:
 *   name: Presentation
 *   description: This Tag use for Presentation.
 */

/**
* @swagger
* components:
*   schemas:
*     PresentComponent:
*       type: object
*       properties:
*         presentFileId:
*           type: integer
*           description: to use for connect relation with present file.
*         presentTo:
*           type: string
*           description: to use for a creating description to database.
*         presentDate:
*           type: string
*           example: 2025-01-01
*           description: to use for a creating description to database.
*         description:
*           type: string
*           description: to use for a creating description to database.
*/

/**
* @swagger
* /api/app/presentation/presentkpi:
*   post:
*     tags: [Presentation]
*     summary: Create a presentation to kpi
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/PresentComponent'
*     responses:
*       201:
*         description: Create a presentation to kpi successfully
*/
router.post('/presentkpi', addNewPresentKPI);

/**
* @swagger
* /api/app/presentation/productpresentqty:
*   get:
*     tags: [Presentation]
*     summary: Getting Qty of Product Present KPI By Sale
*     responses:
*       200:
*         description: Getting Qty of Product Present KPI By Sale successfully
*/
router.get('/productpresentqty', getQtyProdcutPresentKPIBySale);

/**
* @swagger
* /api/app/presentation/productpresentqtTop:
*   get:
*     tags: [Presentation]
*     summary: Getting Qty of Product Present KPI Top By Sale
*     responses:
*       200:
*         description: Getting Qty of Product Present KPI Top By Sale successfully
*/
router.get('/productpresentqtTop', getQtyProdcutPresentKPIBySaleTop);

/**
* @swagger
* /api/app/presentation/topsupplierkpi:
*   get:
*     tags: [Presentation]
*     summary: Getting Qty of Supplier by Product Present KPI Top By Sale
*     responses:
*       200:
*         description: Getting Qty of Supplier by Product Present KPI Top By Sale successfully
*/
router.get('/topsupplierkpi', getTopSupplierForPresentKpi);

module.exports = router;
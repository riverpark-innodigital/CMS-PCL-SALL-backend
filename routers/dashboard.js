const express = require('express');
const router = express.Router();
const { addView, getProductsTotal, getSuppliersTotal, getProductsDashBoard, getTop5Suppliers, getMostViewProduct, getTopPresentKpi, getProductOverview } = require('../controller/dashboard-controller');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard Management
 */

/**
* @swagger
* /api/Dashboard/addView:
*   post:
*     tags: [Dashboard]
*     summary: Add View
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*               type: object
*               properties:
*                   ObjectId:
*                       type: string
*                       description: to tell which ID of Product/Supplier is prefer.
*                   ObjectType:
*                       type: string
*                       description: to tell which Type of Product or Supplier is prefer.
*     responses:
*       201:
*         description: Added to View
*/
router.post('/addView', addView);

/**
* @swagger
* /api/Dashboard/getProductsTotal:
*   get:
*     tags: [Dashboard]
*     summary: getting all the amount of products
*     responses:
*       200:
*         description: getting all the amount of products successfully
*/
router.get('/getProductsTotal', getProductsTotal);

/**
* @swagger
* /api/Dashboard/getSuppliersTotal:
*   get:
*     tags: [Dashboard]
*     summary: getting all the amount of suppliers
*     responses:
*       200:
*         description: getting all the amount of suppliers successfully
*/
router.get('/getSuppliersTotal', getSuppliersTotal);

/**
* @swagger
* /api/Dashboard/getProductsDashBoard:
*   get:
*     tags: [Dashboard]
*     summary: getting all the products with views include
*     responses:
*       200:
*         description: getting all the products with views include successfully
*/
router.get('/getProductsDashBoard', getProductsDashBoard);

/**
* @swagger
* /api/Dashboard/getTop5Suppliers:
*   get:
*     tags: [Dashboard]
*     summary: getting the top 5 viewed suppliers
*     responses:
*       200:
*         description: getting the top 5 viewed suppliers successfully
*/
router.get('/getTop5Suppliers', getTop5Suppliers);

/**
* @swagger
* /api/Dashboard/getMostViewProduct:
*   get:
*     tags: [Dashboard]
*     summary: getting the most viewed product
*     responses:
*       200:
*         description: getting the most viewed product successfully
*/
router.get('/getMostViewProduct', getMostViewProduct);

/**
* @swagger
* /api/Dashboard/get_product_overview:
*   get:
*     tags: [Dashboard]
*     summary: getting product ref by present kpi
*     responses:
*       200:
*         description: getting product ref by present kpi successfully
*/
router.get('/get_product_overview', getProductOverview);

/**
* @swagger
* /api/Dashboard/getallpresent:
*   get:
*     tags: [Dashboard]
*     summary: getting the top 5 suppliers by product presentation.
*     responses:
*       200:
*         description: getting the top 5 suppliers by product presentation successfully
*/
router.get('/getallpresent', getTopPresentKpi);

module.exports = router;
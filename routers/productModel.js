const express = require('express');
const router = express.Router();

const { prdModelCreate, delProductModelById, getAllModel, getModelById, updateModelById, getProductModelBySupId } = require('../controller/productModel-controller');

/**
 * @swagger
 * tags:
 *   name: Model
 *   description: Model management
 */

/**
* @swagger
* components:
*   schemas:
*     productModelUpdate:
*       type: object
*       properties:
*         ModelNameTh:
*           type: string
*           description: to use for a creating Model name th languages.
*         ModelNameEn:
*           type: string
*           description: to use for a creating Model name eng languages.
*         ModelCode:
*           type: string
*           description: to use for a creating Group Code.
*         SupplierId:
*           type: number
*           description: Enter Supplier ID for create Model.
*         Active:
*           type: boolean
*           description: Set Active
*         UpdateBy:
*           type: string
*           description: The user's name

*     productModel:
*       type: object
*       allOf:
*         - $ref: '#/components/schemas/productModelUpdate'
*       properties:
*         CreateBy:
*           type: string
*           description: The user's name
*/

/**
* @swagger
* /api/productModel/model:
*   post:
*     tags: [Model]
*     summary: Create a new Model
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/productModel'
*     responses:
*       201:
*         description: Group created
*/
router.post('/model', prdModelCreate);

/**
* @swagger
* /api/productModel/model/{ProductModelId}:
*   delete:
*     tags: [Model]
*     summary: deleting Model
*     parameters:
*       - in: path
*         name: ProductModelId
*         required: true
*         description: The ID of the Model to deleting
*         schema:
*           type: string
*     responses:
*       200:
*         description: deleting Model successfully
*/
router.delete('/model/:ProductModelId', delProductModelById);

/**
* @swagger
* /api/productModel/models:
*   get:
*     tags: [Model]
*     summary: getting all Models
*     responses:
*       200:
*         description: getting all Models successfully
*/
router.get('/models', getAllModel);

/**
* @swagger
* /api/productModel/model/{ProductModelId}:
*   get:
*     tags: [Model]
*     summary: getting Model By Id
*     parameters:
*       - in: path
*         name: ProductModelId
*         required: true
*         description: The ID of the Model to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: getting Model by id successfully
*/
router.get('/model/:ProductModelId', getModelById);

/**
* @swagger
* /api/productModel/model/{ProductModelId}:
*   put:
*     tags: [Model]
*     summary: Update Model
*     parameters:
*       - in: path
*         name: ProductModelId
*         required: true
*         description: The ID of the Model to update
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/productModelUpdate'
*     responses:
*       201:
*         description: Model updated
*/
router.put('/model/:ProductModelId', updateModelById);

/**
* @swagger
* /api/productModel/modelbysup/{SupplierId}:
*   get:
*     tags: [Model]
*     summary: getting Groups by SupplierId.
*     parameters:
*       - in: path
*         name: SupplierId
*         required: true
*         description: The ID of the Group to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: Getting Groups by SupplierId successfully.
*/
router.get('/modelbysup/:SupplierId', getProductModelBySupId);

module.exports = router;
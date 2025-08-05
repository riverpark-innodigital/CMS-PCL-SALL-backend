const express = require('express');
const router = express.Router();
const upload = require('../hooks/multer');

const { supplieCreate, supplieUpdate, getAllSupplier, getSupplieById, delSuplById, getSupplierByCompanyId, getSupByProductGroup } = require('../controller/supplier-controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     SupplierForUpdate:
 *       type: object
 *       properties:
 *         suplNmTh:
 *           type: string
 *           description: Supplier name in Thai.
 *           example: "Example Supplier TH"
 *         suplNmEn:
 *           type: string
 *           description: Supplier name in English.
 *           example: "Example Supplier EN"
 *         colorCode:
 *           type: string
 *           description: colorCode.
 *           example: "#1677ff"
 *         companyId:
 *           type: array
 *           items:
 *             type: integer
 *           description: Array of Company IDs associated with the supplier.
 *           example: [1, 2]
 *         suplImg:
 *           type: string
 *           format: binary
 *           description: Uploaded image for the supplier.
 *         suplDescripTH:
 *           type: string
 *           description: Supplier description in Thai.
 *           example: "Supplier description in Thai"
 *         suplDescripEN:
 *           type: string
 *           description: Supplier description in English.
 *           example: "Supplier description in English"
 *         Active:
 *           type: boolean
 *           description: Supplier status (active/inactive).
 *           example: true
 *         updateBy:
 *           type: string
 *           description: The user's name who updated the supplier.
 *           example: "John Doe"
 * 
 *     Supplier:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/SupplierForUpdate'
 *       properties:
 *         createBy:
 *           type: string
 *           description: The user's name who created the supplier.
 *           example: "John Doe"
 * 
 * /api/supplierManage/supplier:
 *   post:
 *     tags: [Supplier]
 *     summary: Create a new supplier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Supplier'
 *     responses:
 *       201:
 *         description: Supplier created successfully.
 */
router.post('/supplier', upload.single('suplImg'), supplieCreate);

/**
* @swagger
* /api/supplierManage/supplier/{supplierID}:
*   put:
*     tags: [Supplier]
*     summary: Update an existing supplier
*     parameters:
*       - in: path
*         name: supplierID
*         required: true
*         description: The ID of the supplier to update
*         schema:
*           type: integer
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             allOf:
*               - $ref: '#/components/schemas/SupplierForUpdate'
*             properties:
*               suplImg:
*                 type: string
*                 format: binary
*                 description: Supplier image file
*     responses:
*       200:
*         description: Supplier updated successfully
*       404:
*         description: Supplier not found
*       500:
*         description: Server error
*/
router.put('/supplier/:supplierID', upload.single('suplImg'), supplieUpdate);


/**
* @swagger
* /api/supplierManage/supplier:
*   get:
*     tags: [Supplier]
*     summary: getting all supplier
*     responses:
*       200:
*         description: getting all supplier successfully
*/
router.get('/supplier', getAllSupplier);

/**
* @swagger
* /api/supplierManage/supplier/{supplierID}:
*   get:
*     tags: [Supplier]
*     summary: getting supplier By Id
*     parameters:
*       - in: path
*         name: supplierID
*         required: true
*         description: The ID of the supplier to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: getting supplier by id successfully
*/
router.get('/supplier/:supplierID', getSupplieById);

/**
* @swagger
* /api/supplierManage/supplier/{supplierID}:
*   delete:
*     tags: [Supplier]
*     summary: deleting supplier
*     parameters:
*       - in: path
*         name: supplierID
*         required: true
*         description: The ID of the supplier to deleting
*         schema:
*           type: string
*     responses:
*       200:
*         description: deleting supplier successfully
*/
router.delete('/supplier/:supplierID', delSuplById);

/**
* @swagger
* /api/supplierManage/supplier_comid/{companyId}:
*   get:
*     tags: [Supplier]
*     summary: getting supplier By Company ID
*     parameters:
*       - in: path
*         name: companyId
*         required: true
*         description: The ID of the supplier to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: getting supplier by company id successfully
*/
router.get('/supplier_comid/:companyId', getSupplierByCompanyId);

/**
* @swagger
* /api/supplierManage/supbypgroup/{pgroupId}:
*   get:
*     tags: [Supplier]
*     summary: getting supplier by product group
*     parameters:
*       - in: path
*         name: pgroupId
*         required: true
*         description: The ID of the supplier to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: getting supplier by product group successfully
*/
router.get('/supbypgroup/:pgroupId', getSupByProductGroup);


module.exports = router;
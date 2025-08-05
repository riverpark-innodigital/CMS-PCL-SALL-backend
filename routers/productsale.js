const express = require('express');
const router = express.Router();
const upload = require('../hooks/multer');

const {
    getAllProduct,
    productCreate,
    getProductById,
    getProductBySuplId,
    editProductById,
    delProductById,
    getAllProductTable,
    createProductController,
    updateProductById,
    getProductByIdFord,
    editProductByIdNoChildDelete,
    getProductBySuplIdFavOnly
} = require('../controller/product-controller');

router.post('/createProductController', createProductController);

/**
 * @swagger
 * tags:
 *   name: Productsale
 *   description: Product management
 */

router.get('/fetchAll', getAllProductTable);
/**
* @swagger
* /api/productsale/fetchAll:
*   get:
*     tags: [Productsale]
*     summary: fetchAll
*     responses:
*       200:
*         description: getting product by id successfully
*/
router.get('/product', getAllProduct);
/**
* @swagger
* /api/productsale/product:
*   get:
*     tags: [Productsale]
*     summary: getting all product
*     responses:
*       200:
*         description: getting product by id successfully
*/
router.put('/product/:proId/a', updateProductById);

router.post('/product', upload.fields([
    { name: 'ProductUpVideo', maxCount: 1 },
    { name: 'ProductImageMain', maxCount: 1 },
    { name: 'ProductImageChildren', maxCount: 20 },
    { name: 'presentFiles', maxCount: 20 },
]), productCreate);
/**
 * @swagger
 * /api/productsale/product:
 *   post:
 *     tags:
 *       - Productsale
 *     summary: Create a new product
 *     description: Creates a new product with optional child images.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               SupplierId:
 *                 type: integer
 *                 example: 2
 *               GroupProductId:
 *                 type: integer
 *                 example: 2
 *                 required: false
 *               CompanyId:
 *                 type: integer
 *                 example: 2
 *                 required: false
 *               BuId:
 *                 type: integer
 *                 example: 2
 *                 required: false
 *               ModelProductId:
 *                 type: integer
 *                 example: 2
 *                 required: false
 *               ProductCode:
 *                 type: string
 *                 example: "CD-1313"
 *                 required: false
 *               ProductNameTh:
 *                 type: string
 *                 example: "แรม"
 *               ProductNameEn:
 *                 type: string
 *                 example: "ram"
 *               ProductDescriptionHeaderTh:
 *                 type: string
 *                 example: "หัวข้อ"
 *               ProductDescriptionDetailTh:
 *                 type: string
 *                 example: "รายละเอียด"
 *               ProductDescriptionHeaderEn:
 *                 type: string
 *                 example: "Header"
 *               ProductDescriptionDetailEn:
 *                 type: string
 *                 example: "Descript"
 *               MediaTitle:
 *                 type: string
 *                 example: "MediaTitle"
 *               MediaDescription:
 *                 type: string
 *                 example: "MediaDescription"
 *               ProductVideo:
 *                 type: string
 *                 example: "link"
 *               ProductUpVideo:
 *                 type: string
 *                 format: binary
 *                 required: false
 *               ProductImageMain:
 *                 type: string
 *                 format: binary
 *                 required: false
 *               ProductImageChildren:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 required: false
 *               presentFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 required: false
 *               Active:
 *                 type: boolean
 *                 example: true
 *               CreateBy:
 *                 type: string
 *                 example: "Porjai Mak"
 *               UpdateBy:
 *                 type: string
 *                 example: "Projai Mak"
 *               ExpireDate:
 *                  type: string
 *                  format: date
 *                  description: Pick a Date
 *     responses:
 *        201:
 *          description: Product created
 */

router.get('/product/:productID', getProductById);
/**
* @swagger
* /api/productsale/product/{productID}:
*   get:
*     tags: [Productsale]
*     summary: getting product by id
*     parameters:
*       - name: productID
*         in: path
*         required: true
*         schema:
*           type: integer
*           description: The ID of the product to edit
*     responses:
*       200:
*         description: getting product by id successfully
*/

router.get('/products/:supplierId', getProductBySuplId);
/**
* @swagger
* /api/productsale/products/{supplierId}:
*   get:
*     tags: [Productsale]
*     summary: getting all product by Supplier's id
*     parameters:
*       - name: supplierId
*         in: path
*         required: true
*         schema:
*           type: integer
*           description: The ID of the Supplier to getting Products
*     responses:
*       200:
*         description: getting product by Supplier's id successfully
*/

router.put('/product/:productID', upload.fields([
    { name: 'ProductUpVideo', maxCount: 1 },
    { name: 'ProductImageMain', maxCount: 1 },
    { name: 'ProductImageChildren', maxCount: 10 }
]), editProductById);
/**
 * @swagger
 * /api/productsale/product/{productID}:
 *   put:
 *     tags:
 *       - Productsale
 *     summary: Edit an existing product
 *     description: Edits an existing product and updates its details or images.
 *     parameters:
 *       - name: productID
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           description: The ID of the product to edit
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               SupplierId:
 *                 type: integer
 *                 example: 2
 *               GroupProductId:
 *                 type: integer
 *                 example: 2
 *                 required: false
 *               BuId:
 *                 type: integer
 *                 example: 2
 *                 required: false
 *               CompanyId:
 *                 type: integer
 *                 example: 2
 *                 required: false
 *               ModelProductId:
 *                 type: integer
 *                 example: 2
 *                 required: false
 *               ProductCode:
 *                 type: string
 *                 example: "CD-1313"
 *                 required: false
 *               ProductNameTh:
 *                 type: string
 *                 description: Product name in Thai
 *               ProductNameEn:
 *                 type: string
 *                 description: Product name in English
 *               ProductDescriptionHeaderTh:
 *                 type: string
 *               ProductDescriptionDetailTh:
 *                 type: string
 *               ProductDescriptionHeaderEn:
 *                 type: string
 *               ProductDescriptionDetailEn:
 *                 type: string
 *               MediaTitle:
 *                 type: string
 *                 example: "MediaTitle"
 *               MediaDescription:
 *                 type: string
 *                 example: "MediaDescription"
 *               RemoveVideo:
 *                 type: boolean
 *                 example: false
 *               ProductVideo:
 *                 type: string
 *                 example: "link"
 *               ProductUpVideo:
 *                 type: string
 *                 format: binary
 *                 required: false
 *               ProductImageMain:
 *                 type: string
 *                 format: binary
 *                 required: false
 *               ProductImageChildren:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 required: false
 *               Active:
 *                 type: boolean
 *                 description: Indicates if the product is active
 *               UpdateBy:
 *                 type: string
 *                 description: Name of the person making the update
 *               ExpireDate:
 *                  type: string
 *                  format: date
 *                  description: Pick a Date
 *     responses:
 *       201:
 *         description: Product updated
 */

router.delete('/product/:productID', delProductById);
/**
* @swagger
* /api/productsale/product/{productID}:
*   delete:
*     tags: [Productsale]
*     summary: deleting Product
*     parameters:
*       - in: path
*         name: productID
*         required: true
*         description: The ID of the Product to delete Product
*         schema:
*           type: string
*     responses:
*       200:
*         description: deleting Product successfully
*/

router.put('/productAddChild/:productID', upload.fields([
    { name: 'ProductImageChildren', maxCount: 10 }
]), editProductByIdNoChildDelete);
/**
 * @swagger
 * /api/productsale/productAddChild/{productID}:
 *   put:
 *     tags:
 *       - Productsale
 *     summary: Edit an existing product while keeping the related images and adding new ones.
 *     description: Edits an existing product and updates its details or images.
 *     parameters:
 *       - name: productID
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           description: The ID of the product to edit
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               ProductImageChildren:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 required: false
 *     responses:
 *       201:
 *         description: Product updated
 */

module.exports = router;
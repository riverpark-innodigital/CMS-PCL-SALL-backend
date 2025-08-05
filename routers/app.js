const express = require('express');
const router = express.Router();
const upload = require('../hooks/multer');

const {
    getProductByIdApp, getProductBySuplIdApp, getProductBySuplIdFavOnly,
    getAllSupplierApp, getSupplieByIdApp, getFolderByIdApp, getFileByFolderApp,
    getAllSupplierFavOnlyApp, getProductFavOnly, getSearchSupplierApp, getProductBySearchApp,
    getSearchSupplierFavOnlyApp, getFavProductBySearchApp, getSupplierByCompanyApp,
    getSearchSupplierByCompanyApp, getSupplierInBusiness, getProductEachGroup
} = require('../controller/app-controller');

/**
 * @swagger
 * tags:
 *   name: App
 *   description: App's Data Fetching
 */

router.get('/productsApp/:supplierId/:page/:amount', getProductBySuplIdApp);
/**
* @swagger
* /api/appFetch/productsApp/{supplierId}/{page}/{amount}:
*   get:
*     tags: [App]
*     summary: getting all product by Supplier's id [App]
*     parameters:
*       - name: supplierId
*         in: path
*         required: true
*         schema:
*           type: integer
*           description: The ID of the Supplier to getting Products
*       - name: page
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Page number
*       - name: amount
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Number of items per page
*     responses:
*       200:
*         description: getting product by Supplier's id successfully
*/

router.get('/productsSearchApp/:supplierId/:page/:amount/:searchType/:searchValue', getProductBySearchApp);
/**
* @swagger
* /api/appFetch/productsSearchApp/{supplierId}/{page}/{amount}/{searchType}/{searchValue}:
*   get:
*     tags: [App]
*     summary: getting Searched products [App]
*     parameters:
*       - name: supplierId
*         in: path
*         required: true
*         schema:
*           type: integer
*           description: The ID of the Supplier to getting Products
*       - name: page
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Page number
*       - name: amount
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Number of items per page
*       - name: searchType
*         in: path
*         required: true
*         schema:
*           type: string
*         description: Field to search
*       - name: searchValue
*         in: path
*         required: true
*         schema:
*           type: string
*         description: Value to search
*     responses:
*       200:
*         description: getting product by searching successfully
*/

router.get('/productsFavSearchApp/:supplierId/:page/:amount/:searchType/:searchValue', getFavProductBySearchApp);
/**
* @swagger
* /api/appFetch/productsFavSearchApp/{supplierId}/{page}/{amount}/{searchType}/{searchValue}:
*   get:
*     tags: [App]
*     summary: getting Searched Fav products [App]
*     parameters:
*       - name: supplierId
*         in: path
*         required: true
*         schema:
*           type: integer
*           description: The ID of the Supplier to getting Products
*       - name: page
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Page number
*       - name: amount
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Number of items per page
*       - name: searchType
*         in: path
*         required: true
*         schema:
*           type: string
*         description: Field to search
*       - name: searchValue
*         in: path
*         required: true
*         schema:
*           type: string
*         description: Value to search
*     responses:
*       200:
*         description: getting fav product by searching successfully
*/

router.get('/allProductsFav', getProductFavOnly);
/**
* @swagger
* /api/appFetch/allProductsFav:
*   get:
*     tags: [App]
*     summary: getting all Favorited product Only
*     responses:
*       200:
*         description: getting all Favorited product Only successfully
*/

router.get('/productsFav/:supplierId/:page/:amount', getProductBySuplIdFavOnly);
/**
* @swagger
* /api/appFetch/productsFav/{supplierId}/{page}/{amount}:
*   get:
*     tags: [App]
*     summary: getting all product by Supplier's id Favorite Only
*     parameters:
*       - name: supplierId
*         in: path
*         required: true
*         schema:
*           type: integer
*           description: The ID of the Supplier to getting Products
*       - name: page
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Page number
*       - name: amount
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Number of items per page
*     responses:
*       200:
*         description: getting product by Supplier's id successfully
*/

router.get('/productApp/:productID', getProductByIdApp);
/**
* @swagger
* /api/appFetch/productApp/{productID}:
*   get:
*     tags: [App]
*     summary: getting product by id [App]
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

router.get('/supplierApp/:page/:amount', getAllSupplierApp);
/**
* @swagger
* /api/appFetch/supplierApp/{page}/{amount}:
*   get:
*     tags: [App]
*     summary: getting all supplier [App]
*     parameters:
*       - name: page
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Page number
*       - name: amount
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Number of items per page
*     responses:
*       200:
*         description: getting all supplier successfully
*/

router.get('/supplierSearchApp/:page/:amount/:searchType/:searchValue', getSearchSupplierApp);
/**
* @swagger
* /api/appFetch/supplierSearchApp/{page}/{amount}/{searchType}/{searchValue}:
*   get:
*     tags: [App]
*     summary: getting Searched suppliers [App]
*     parameters:
*       - name: page
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Page number
*       - name: amount
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Number of items per page
*       - name: searchType
*         in: path
*         required: true
*         schema:
*           type: string
*         description: Field to search
*       - name: searchValue
*         in: path
*         required: true
*         schema:
*           type: string
*         description: Value to search
*     responses:
*       200:
*         description: getting Searched suppliers successfully
*/

router.get('/supplierFavApp/:page/:amount', getAllSupplierFavOnlyApp);
/**
* @swagger
* /api/appFetch/supplierFavApp/{page}/{amount}:
*   get:
*     tags: [App]
*     summary: getting all supplier [App]
*     parameters:
*       - name: page
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Page number
*       - name: amount
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Number of items per page
*     responses:
*       200:
*         description: getting all supplier successfully
*/

router.get('/supplierSearchFavApp/:page/:amount/:searchType/:searchValue', getSearchSupplierFavOnlyApp);
/**
* @swagger
* /api/appFetch/supplierSearchFavApp/{page}/{amount}/{searchType}/{searchValue}:
*   get:
*     tags: [App]
*     summary: getting Searched supplier [App]
*     parameters:
*       - name: page
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Page number
*       - name: amount
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Number of items per page
*       - name: searchType
*         in: path
*         required: true
*         schema:
*           type: string
*         description: Field to search
*       - name: searchValue
*         in: path
*         required: true
*         schema:
*           type: string
*         description: Value to search
*     responses:
*       200:
*         description: getting Searched supplier successfully
*/

router.get('/supplierApp/:supplierID', getSupplieByIdApp);
/**
* @swagger
* /api/appFetch/supplierApp/{supplierID}:
*   get:
*     tags: [App]
*     summary: getting supplier By Id [App]
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

router.get('/productFolderApp/:productId', getFolderByIdApp);
/**
* @swagger
* /api/appFetch/productFolderApp/{productId}:
*   get:
*     tags: [App]
*     summary: getting folder by Product's id [App]
*     parameters:
*       - in: path
*         name: productId
*         required: true
*         description: The ID of Product to get Folder's id
*         schema:
*           type: string
*     responses:
*       200:
*         description: getting folder by id successfully
*/

router.get('/productFileApp/:folderId', getFileByFolderApp);
/**
* @swagger
* /api/appFetch/productFileApp/{folderId}:
*   get:
*     tags: [App]
*     summary: getting File by Folder id [App]
*     parameters:
*       - in: path
*         name: folderId
*         required: true
*         description: The ID of the Folder to getting File
*         schema:
*           type: string
*     responses:
*       200:
*         description: getting File by id successfully
*/

router.get('/supplierCompanyApp/:companyId/:page/:amount', getSupplierByCompanyApp);
/**
* @swagger
* /api/appFetch/supplierCompanyApp/{companyId}/{page}/{amount}:
*   get:
*     tags: [App]
*     summary: getting all supplier by company [App]
*     parameters:
*       - name: companyId
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Supplier's CompanyId
*       - name: page
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Page number
*       - name: amount
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Number of items per page
*     responses:
*       200:
*         description: getting all supplier by company successfully
*/

router.get('/supplierSearchCompanyApp/:companyId/:page/:amount/:searchType/:searchValue', getSearchSupplierByCompanyApp);
/**
* @swagger
* /api/appFetch/supplierSearchCompanyApp/{companyId}/{page}/{amount}/{searchType}/{searchValue}:
*   get:
*     tags: [App]
*     summary: getting Searched suppliers by Company [App]
*     parameters:
*       - name: companyId
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Company Id
*       - name: page
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Page number
*       - name: amount
*         in: path
*         required: true
*         schema:
*           type: integer
*         description: Number of items per page
*       - name: searchType
*         in: path
*         required: true
*         schema:
*           type: string
*         description: Field to search
*       - name: searchValue
*         in: path
*         required: true
*         schema:
*           type: string
*         description: Value to search
*     responses:
*       200:
*         description: getting Searched suppliers by Company successfully
*/

router.get('/companyBU/:companyId', getSupplierInBusiness);
/**
 * @swagger
 * /api/appFetch/companyBU/{companyId}:
 *   get:
 *     tags: [App]
 *     summary: Get suppliers in a business unit by company ID [App]
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         description: The ID of the company to fetch business units and suppliers for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved suppliers in business units for the company
 *       404:
 *         description: Company not found
 *       500:
 *         description: Server error
 */

router.get('/productGroup/:supplierId', getProductEachGroup);
/**
 * @swagger
 * /api/appFetch/productGroup/{supplierId}:
 *   get:
 *     tags: [App]
 *     summary: Get product groups and products for a supplier [App]
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         description: The ID of the supplier
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved product groups and products
 *       404:
 *         description: Supplier not found
 *       500:
 *         description: Server error
 */

module.exports = router;
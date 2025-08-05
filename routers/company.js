const express = require('express');
const router = express.Router();
const {
    createCompany,
    gettingCompanys,
    gettingCompanysById,
    updatingCompanyById,
    deletingCompanyById,
    getCompanyBySup,
 } = require('../controller/company-controller');
const upload = require('../hooks/multer');

/**
 * @swagger
 * tags:
 *   name: Companys
 *   description: Company management
 */

/**
* @swagger
* components:
*   schemas:
*     Companys:
*       type: object
*       properties:
*         NameTH:
*           type: string
*           description: to use for a creating name th languages.
*         NameEN:
*           type: string
*           description: to use for a creating name eng languages.
*         BUNameTH:
*           type: string
*           description: to use for a creating Bussiness Unit name th languages.
*         BUNameEN:
*           type: string
*           description: to use for a creating Bussiness Unit name eng languages.
*         BU:
*           type: string
*           example: [1,2,3]
*           description: to use for a creating Code.
*         compamyFile:
*           type: string
*           format: binary
*           description: to use for uploaded image to server and database.
*           required: false
*         compamyPicture:
*           type: string
*           format: binary
*           description: to use for uploaded image to server and database.
*           required: false
*         DescriptionTH:
*           type: string
*           description: The details of in Thai.
*         DescriptionEN:
*           type: string
*           description: The details of in English.
*         Active:
*           type: boolean
*           description: Set Active
*/

/**
* @swagger
* /api/companyManage/compamy:
*   post:
*     tags: [Companys]
*     summary: Create new a company
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             $ref: '#/components/schemas/Companys'
*     responses:
*       201:
*         description: company created successfully
*/
router.post('/compamy', upload.fields([
    { name: 'compamyFile', maxCount: 1 },
    { name: 'compamyPicture', maxCount: 1 },
]), createCompany);

/**
* @swagger
* /api/companyManage/compamy:
*   get:
*     tags: [Companys]
*     summary: getting all company
*     responses:
*       200:
*         description: getting all company successfully
*/
router.get('/compamy', gettingCompanys);

/**
* @swagger
* /api/companyManage/compamy/{CompanyID}:
*   get:
*     tags: [Companys]
*     summary: getting company By Id
*     parameters:
*       - in: path
*         name: CompanyID
*         required: true
*         description: The ID of the company to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: getting company by id successfully
*/
router.get('/compamy/:CompanyID', gettingCompanysById);

/**
* @swagger
* /api/companyManage/compamy/{CompanyID}:
*   put:
*     tags: [Companys]
*     summary: Updating company by company id
*     parameters:
*       - in: path
*         name: CompanyID
*         required: true
*         description: The ID of the updated company
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             $ref: '#/components/schemas/Companys'
*     responses:
*       200:
*         description: Updating company successfully
*/
router.put('/compamy/:CompanyID', upload.fields([
    { name: 'compamyFile', maxCount: 1 },
    { name: 'compamyPicture', maxCount: 1 },
]), updatingCompanyById);

/**
* @swagger
* /api/companyManage/compamy/{CompanyID}:
*   delete:
*     tags: [Companys]
*     summary: deleting company By Id
*     parameters:
*       - in: path
*         name: CompanyID
*         required: true
*         description: The ID of the company to delete
*         schema:
*           type: string
*     responses:
*       200:
*         description: deleting company by id successfully
*/
router.delete('/compamy/:CompanyID', deletingCompanyById);

/**
* @swagger
* /api/companyManage/companybysup/{supId}:
*   get:
*     tags: [Companys]
*     summary: getting supplier by product group
*     parameters:
*       - in: path
*         name: supId
*         required: true
*         description: The ID of the company to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: getting company by suplier successfully
*/
router.get('/companybysup/:supId', getCompanyBySup);

module.exports = router;
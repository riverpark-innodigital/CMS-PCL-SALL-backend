const express = require('express');
const router = express.Router();
const upload = require('../hooks/multer');

const { 

    folderCreate, fileCreate,
    getFolderById, getFileByFolder, 
    productFolderUpdate, productFileUpdate,
    delFolder, delFile

} = require('../controller/productFile-controller');

/**
 * @swagger
 * tags:
 *   name: Product File Management
 *   description: File/Folder of Product management
 */

/**
* @swagger
* components:
*   schemas:
*     ProductFolderUpdate:
*       type: object
*       properties:
*         ProductFolderId:
*           type: integer
*           description: to use for a update.
*         ProductFolderNameTh:
*           type: string
*           description: to use for a creating Product Folder's name th languages.
*         ProductFolderNameEn:
*           type: string
*           description: to use for a creating Product Folder's name eng languages.
*         UpdateBy:
*           type: string
*           description: The user's name

*     ProductFileUpdate:
*       type: object
*       properties:
*         ProductFileNameTh:
*           type: string
*           description: to use for a creating Product File's name th languages.
*         ProductFileNameEn:
*           type: string
*           description: to use for a creating Product File's name eng languages.
*         ProductFolderId:
*           type: integer
*           description: to tell which Folder the File is belong to.
*         Active:
*           type: boolean
*           description: Set Active
*         ProductFile:
*           type: string
*           format: binary
*           description: Upload the File of Product
*           required: false
*         UpdateBy:
*           type: string
*           description: The user's name

*     ProductFolder:
*       type: object
*       allOf:
*         - $ref: '#/components/schemas/ProductFolderUpdate'
*       properties:
*         CreateBy:
*           type: string
*           description: The user's name

*     ProductFile:
*       type: object
*       allOf:
*         - $ref: '#/components/schemas/ProductFileUpdate'
*       properties:
*         CreateBy:
*           type: string
*           description: The user's name
*/

/**
* @swagger
* /api/productManage/productfolder:
*   post:
*     tags: [Product File Management]
*     summary: Create new Folders
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: array
*             items:
*               $ref: '#/components/schemas/ProductFolder'
*     responses:
*       201:
*         description: Folders created successfully
*/
router.post('/productfolder', folderCreate);

/**
* @swagger
* /api/productManage/productFile:
*   post:
*     tags: [Product File Management]
*     summary: Create a new File
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             $ref: '#/components/schemas/ProductFile'
*     responses:
*       201:
*         description: File created
*/
router.post('/productFile', upload.single('ProductFile'), fileCreate);

/**
* @swagger
* /api/productManage/productFolder/{productId}:
*   get:
*     tags: [Product File Management]
*     summary: getting folder by Product's id
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
router.get('/productFolder/:productId', getFolderById);

/**
* @swagger
* /api/productManage/productFile/{folderId}:
*   get:
*     tags: [Product File Management]
*     summary: getting File by Folder id
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
router.get('/productFile/:folderId', getFileByFolder);

/**
 * @swagger
 * /api/productManage/productFolder:
 *   put:
 *     tags: [Product File Management]
 *     summary: Update Folder(s)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/ProductFolderUpdate'
 *     responses:
 *       200:
 *         description: Folder(s) updated
 */
router.put('/productFolder', productFolderUpdate);

/**
* @swagger
* /api/productManage/productFile/{fileId}:
*   put:
*     tags: [Product File Management]
*     summary: update File
*     parameters:
*       - in: path
*         name: fileId
*         required: true
*         description: The ID of the File to update
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             $ref: '#/components/schemas/ProductFileUpdate'
*     responses:
*       201:
*         description: File updated
*/
router.put('/productFile/:fileId', upload.single('ProductFile'), productFileUpdate);

/**
* @swagger
* /api/productManage/productFolder/{folderId}:
*   delete:
*     tags: [Product File Management]
*     summary: deleting Folder
*     parameters:
*       - in: path
*         name: folderId
*         required: true
*         description: The ID of the Folder to deleting
*         schema:
*           type: string
*     responses:
*       200:
*         description: deleting Folder successfully
*/
router.delete('/productFolder/:folderId', delFolder);

/**
* @swagger
* /api/productManage/productFile/{fileId}:
*   delete:
*     tags: [Product File Management]
*     summary: deleting File
*     parameters:
*       - in: path
*         name: fileId
*         required: true
*         description: The ID of the File to deleting
*         schema:
*           type: string
*     responses:
*       200:
*         description: deleting File successfully
*/
router.delete('/productFile/:fileId', delFile);

module.exports = router;
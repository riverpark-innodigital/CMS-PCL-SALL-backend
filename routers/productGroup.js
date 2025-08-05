const express = require('express');
const router = express.Router();
const upload = require('../hooks/multer');

const { prdGroupCreate, delProductGroupById, getAllGroup, getGroupById, updateGroupById, getProductGroupBySupId } = require('../controller/productGroup-controller');

/**
 * @swagger
 * tags:
 *   name: Group
 *   description: Group management
 */

/**
* @swagger
* components:
*   schemas:
*     productGroupUpdate:
*       type: object
*       properties:
*         GroupNameTh:
*           type: string
*           description: to use for a creating Group name th languages.
*         GroupNameEn:
*           type: string
*           description: to use for a creating Group name eng languages.
*         GroupCode:
*           type: string
*           description: to use for a creating Group Code.
*         Suppliers:
*           type: string
*           example: [1,2,3]
*           description: to connect the relation with Supplier.
*         Active:
*           type: boolean
*           description: Set Active
*         productgroupImage:
*           type: string
*           format: binary
*         UpdateBy:
*           type: string
*           description: The user's name

*     productGroup:
*       type: object
*       allOf:
*         - $ref: '#/components/schemas/productGroupUpdate'
*       properties:
*         CreateBy:
*           type: string
*           description: The user's name
*/

/**
* @swagger
* /api/productGroup/group:
*   post:
*     tags: [Group]
*     summary: Create a new Group
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             $ref: '#/components/schemas/productGroup'
*     responses:
*       201:
*         description: Group created
*/
router.post('/group', upload.single('productgroupImage'), prdGroupCreate);

/**
* @swagger
* /api/productGroup/group/{ProductGroupId}:
*   delete:
*     tags: [Group]
*     summary: deleting Group
*     parameters:
*       - in: path
*         name: ProductGroupId
*         required: true
*         description: The ID of the Group to deleting
*         schema:
*           type: string
*     responses:
*       200:
*         description: deleting Group successfully
*/
router.delete('/group/:ProductGroupId', delProductGroupById);

/**
* @swagger
* /api/productGroup/groups:
*   get:
*     tags: [Group]
*     summary: getting all Groups
*     responses:
*       200:
*         description: getting all Groups successfully
*/
router.get('/groups', getAllGroup);

/**
* @swagger
* /api/productGroup/group/{ProductGroupId}:
*   get:
*     tags: [Group]
*     summary: getting Group By Id
*     parameters:
*       - in: path
*         name: ProductGroupId
*         required: true
*         description: The ID of the Group to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: getting Group by id successfully
*/
router.get('/group/:ProductGroupId', getGroupById);

/**
* @swagger
* /api/productGroup/group/{ProductGroupId}:
*   put:
*     tags: [Group]
*     summary: Update Group
*     parameters:
*       - in: path
*         name: ProductGroupId
*         required: true
*         description: The ID of the Group to update
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
*             $ref: '#/components/schemas/productGroupUpdate'
*     responses:
*       201:
*         description: Group updated
*/
router.put('/group/:ProductGroupId', upload.single('productgroupImage'), updateGroupById);


/**
* @swagger
* /api/productGroup/groupbysup/{SupplierId}:
*   get:
*     tags: [Group]
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
router.get('/groupbysup/:SupplierId', getProductGroupBySupId);


module.exports = router;
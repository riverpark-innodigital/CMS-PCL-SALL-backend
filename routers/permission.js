const express = require("express");
const { 
    createNewGroupPermission,
    GetAllGroupPermission,
    GetGroupPermissionById,
    UpdateGroupPermission,
    DeleteGroupPermissionById,
    createNewPermission,
    gettingPermissionsByUserID,
 } = require("../controller/permission-controller");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: This Tag use for Group & Sale Team Permission Management.
 */

/**
* @swagger
* components:
*   schemas:
*     GroupPermissionUpdateComponent:
*       type: object
*       properties:
*         SaleTeamName:
*           type: string
*           description: to use for a creating sale team name
*         ComId:
*           type: integer
*           description: to use for a connect the relational with company
*         BUID:
*           type: integer
*           description: to use for a connect the relational with business unit
*         Manager:
*           type: integer
*           description: to use for a connect the relational with user
*         Sale:
*           type: array
*           items:
*             type: string
*             example: 1, 2, 3
*           description: to use for a connect the relational with user
*         Active:
*           type: boolean
*           description: to use for specification sale team status.
*
*     PermissionUpdateComponent:
*       type: object
*       properties:
*         GroupPermissionID:
*           type: array
*           items:
*             type: string
*           description: to use for a creating GroupPermission name en languages.
*         UserId:
*           type: string
*           description: to use for a creating GroupPermission name en languages.
*
*     GroupPermissionComponent:
*       type: object
*       allOf:
*         - $ref: '#/components/schemas/GroupPermissionUpdateComponent'
*/

/**
* @swagger
* /api/permission/group_permission:
*   get:
*     tags: [Permissions]
*     summary: Getting all GroupPermissions
*     responses:
*       200:
*         description: Getting all Groups successfully
*/
router.get('/group_permission', GetAllGroupPermission);

/**
* @swagger
* /api/permission/group_permission/{GruopPermissionID}:
*   get:
*     tags: [Permissions]
*     summary: Getting GroupPermissions By ID.
*     parameters:
*       - in: path
*         name: GruopPermissionID
*         required: true
*         description: The ID of the GroupPermissions to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: Getting all GroupPermissions successfully
*/
router.get('/group_permission/:GruopPermissionID', GetGroupPermissionById);

/**
* @swagger
* /api/permission/group_permission:
*   post:
*     tags: [Permissions]
*     summary: Create a new GrouPermission
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/GroupPermissionComponent'
*     responses:
*       201:
*         description: Group Permission Created Success
*/
router.post('/group_permission', createNewGroupPermission);


/**
* @swagger
* /api/permission/group_permission/{GruopPermissionID}:
*   put:
*     tags: [Permissions]
*     summary: Updating a GrouPermission
*     parameters:
*       - in: path
*         name: GruopPermissionID
*         required: true
*         description: The ID of the GroupPermissions to getting
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/GroupPermissionUpdateComponent'
*     responses:
*       200:
*         description: Group Permission Updated Success
*/
router.put('/group_permission/:GruopPermissionID', UpdateGroupPermission);

/**
* @swagger
* /api/permission/group_permission/{GruopPermissionID}:
*   delete:
*     tags: [Permissions]
*     summary: deleting GroupPermission
*     parameters:
*       - in: path
*         name: GruopPermissionID
*         required: true
*         description: The ID of the GroupPermission to deleting
*         schema:
*           type: string
*     responses:
*       200:
*         description: deleting GroupPermission successfully
*/
router.delete('/group_permission/:GruopPermissionID', DeleteGroupPermissionById);


/**
* @swagger
* /api/permission/permission:
*   post:
*     tags: [Permissions]
*     summary: Create a new Permission
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/PermissionUpdateComponent'
*     responses:
*       201:
*         description: Permission Created Success
*/
router.post('/permission', createNewPermission);

/**
* @swagger
* /api/permission/permission/{UserID}:
*   get:
*     tags: [Permissions]
*     summary: Getting Permissions By User ID.
*     parameters:
*       - in: path
*         name: UserID
*         required: true
*         description: The ID of the Permissions to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: Getting Permissions By User ID successfully
*/
router.get('/permission/:UserID', gettingPermissionsByUserID);

module.exports = router;
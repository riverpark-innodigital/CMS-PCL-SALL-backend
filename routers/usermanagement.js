const express = require('express');
const { 
    GettingUserDirectory,
    addnewSingleUser,
    gettingAllUsers,
    updateUser,
    gettingUserById,
    gettinghandlers,
    addNewMultipleUser,
    gettingUserByRole
} = require('../controller/usermanage-controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: UserManagement
 *   description: User management
 */

/**
* @swagger
* components:
*   schemas:
*     SingleUserComponent:
*       type: object
*       properties:
*         ldapUsername:
*           type: string
*           description: to use for a creating GroupPermission name en languages.
*         ldapName:
*           type: string
*           description: to use for a creating GroupPermission name en languages.
*         email:
*           type: string
*           description: to use for a creating GroupPermission name en languages.
*         role:
*           type: integer
*           description: to use for convert a relationship with Company & BU.
*         status:
*           type: string
*           example: active
*           description: to use for specification sale team status.
*
*     MultipleUserComponent:
*       type: object
*       properties:
*         UserdataArr:
*           type: array
*           items:
*             type: string
*           description: to use for a creating GroupPermission name en languages.
*         role:
*           type: integer
*           description: to use for convert a relationship with Company & BU.
*         status:
*           type: string
*           example: active
*           description: to use for specification sale team status.
*
*/


/**
* @swagger
* /api/usermanagement/userdirectory:
*   get:
*     tags: [UserManagement]
*     summary: Get all user directory
*     responses:
*       200:
*         description: Fetch a list of all user directory from the system.
*/
router.get('/userdirectory', GettingUserDirectory);

/**
* @swagger
* /api/usermanagement/users:
*   get:
*     tags: [UserManagement]
*     summary: Get all user
*     responses:
*       200:
*         description: Fetch a list of all user from the system.
*/
router.get('/users', gettingAllUsers);

/**
* @swagger
* /api/usermanagement/users/{ldapUserId}:
*   get:
*     tags: [UserManagement]
*     summary: Updating a GrouPermission
*     parameters:
*       - in: path
*         name: ldapUserId
*         required: true
*         description: The ID of the UserId to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: Group Permission Updated Success
*/
router.get('/users/:ldapUserId', gettingUserById);

/**
* @swagger
* /api/usermanagement/users_role/{role}:
*   get:
*     tags: [UserManagement]
*     summary: Getting users by role name
*     parameters:
*       - in: path
*         name: role
*         required: true
*         description: role name for get data
*         schema:
*           type: string
*     responses:
*       200:
*         description: Getting the users by role name successfully.
*/
router.get('/users_role/:role', gettingUserByRole);

/**
* @swagger
* /api/usermanagement/single_user:
*   post:
*     tags: [UserManagement]
*     summary: Add new Ldap user
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/SingleUserComponent'
*     responses:
*       201:
*         description: Group Added Ldap User Success
*/
router.post('/single_user', addnewSingleUser);

/**
* @swagger
* /api/usermanagement/multiple_user:
*   post:
*     tags: [UserManagement]
*     summary: Add new multiple Ldap user
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/MultipleUserComponent'
*     responses:
*       201:
*         description: Group Added Ldap User Success
*/
router.post('/multiple_user', addNewMultipleUser);

/**
* @swagger
* /api/usermanagement/users/{userId}:
*   put:
*     tags: [UserManagement]
*     summary: Updating a GrouPermission
*     parameters:
*       - in: path
*         name: userId
*         required: true
*         description: The ID of the UserId to getting
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/SingleUserComponent'
*     responses:
*       200:
*         description: Group Permission Updated Success
*/
router.put('/users/:userId', updateUser);

/**
* @swagger
* /api/usermanagement/handlers:
*   get:
*     tags: [UserManagement]
*     summary: Get handler by
*     responses:
*       200:
*         description: Fetch a list of handler by from the system.
*/
router.get('/handlers', gettinghandlers);

module.exports = router;
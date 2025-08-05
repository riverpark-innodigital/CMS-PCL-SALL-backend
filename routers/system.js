const express = require('express');
const router = express.Router();

const {
    createUserRole,
    getRoles
} = require('../controller/system-controller');

/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Role management
 */

/**
* @swagger
* components:
*   schemas:
*     RoleService:
*       type: object
*       properties:
*         nameTH:
*           type: string
*           description: to specific role name is a Thai.
*         nameENG:
*           type: string
*           description: to specific role name is a English.
*         description:
*           type: string
*           description: to specific description this role.
*/

/**
* @swagger
* /api/roles/userroles:
*   post:
*     tags: [Role]
*     summary: Create a new Role
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/RoleService'
*     responses:
*       201:
*         description: Role created
*/
router.post('/userroles', createUserRole);
/**
* @swagger
* /api/roles/userroles:
*   get:
*     tags: [Role]
*     summary: Getting all Role
*     responses:
*       200:
*         description: Getting all Role successfully
*/
router.get('/userroles', getRoles);

module.exports = router;
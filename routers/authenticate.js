const express = require('express');
require('dotenv').config();
const { 
    signin, 
    createagentcy  
} = require('../controller/authenticate-controller');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: authentication
 */

/**
* @swagger
* components:
*   schemas:
*     Authentication:
*       type: object
*       properties:
*         username:
*           type: string
*           example: administrator
*           description: Here, you can take a your username.
*         password:
*           type: string
*           example: 123456
*           description: The passsword of username.
*/

/**
* @swagger
* /api/authenticate/signin:
*   post:
*     tags: [Authentication]
*     summary: authenticate line
*     security:
*       - BearerAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Authentication'
*     responses:
*       201:
*         description: User created
*/
router.post('/signin', signin);
router.post('/createagentcy', createagentcy);

module.exports = router;
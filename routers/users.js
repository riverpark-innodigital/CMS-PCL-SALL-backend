const express = require('express');
const router = express.Router();

const {
    getAllUsers,
    getUserById,
    userCreate,
    userEdit,
    deleteUserById,
    currentuser
} = require('../controller/users-controller');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Users management
 */

/**
* @swagger
* /api/system/user:
*   get:
*     tags: [Users]
*     summary: Get all users
*     responses:
*       200:
*         description: Fetch a list of all users from the system.
*/
router.get('/user', getAllUsers);

/**
* @swagger
* /api/system/user/{userId}:
*   get:
*     tags: [Users]
*     summary: Get a user by ID
*     description: Fetch a single user by their unique ID.
*     parameters:
*       - name: userId
*         in: path
*         required: true
*         description: ID of the user to fetch
*         schema:
*           type: integer
*     responses:
*       200:
*         description: Fetch a user by id from the system.
*/
router.get('/user/:userId', getUserById);

/**
 * @swagger
 * /api/system/user:
 *   post:
 *     tags: [Users]
 *     summary: Create a new user
 *     description: Create a new user in the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Username:
 *                 type: string
 *                 example: john_doe
 *               Password:
 *                 type: string
 *                 example: password123
 *               Name:
 *                 type: string
 *                 example: John Doe
 *               Active:
 *                 type: string
 *                 example: active
 *               RoleId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/user', userCreate);

/**
 * @swagger
 * /api/system/user/{userId}:
 *   put:
 *     tags: [Users]
 *     summary: Update a user by ID
 *     description: Update the details of a user based on their unique ID.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Username:
 *                 type: string
 *                 example: updated_user
 *               Password:
 *                 type: string
 *                 example: updated_password123
 *               Name:
 *                 type: string
 *                 example: Updated User Name
 *               Active:
 *                 type: string
 *                 example: active
 *               RoleId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: User updated
 */
router.put('/user/:userId', userEdit);

/**
 * @swagger
 * /api/system/user/{userId}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user by ID
 *     description: Delete a user from the system based on their unique ID.
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: deleting User by id successfully
 */
router.delete('/user/:userId', deleteUserById);

router.get('/currentuser', currentuser);

module.exports = router;
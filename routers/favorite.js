const express = require('express');
const router = express.Router();

const { favoriteCreate, unFavorite } = require('../controller/favoriteManage-controller');

/**
 * @swagger
 * tags:
 *   name: Favorite
 *   description: Favorite management
 */

/**
* @swagger
* components:
*   schemas:
*     favorite:
*       type: object
*       properties:
*         ObjectId:
*           type: string
*           description: to tell which ID of Product/Supplier is prefer.
*         ObjectType:
*           type: string
*           description: to tell which Type of Product or Supplier is prefer.
*/

/**
* @swagger
* /api/favoriteManage/favorite:
*   post:
*     tags: [Favorite]
*     summary: Add to Favorite
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/favorite'
*     responses:
*       201:
*         description: Added to favorite
*/
router.post('/favorite', favoriteCreate);

/**
* @swagger
* /api/favoriteManage/unfavorite:
*   delete:
*     tags: [Favorite]
*     summary: unfavorite
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/favorite'
*     responses:
*       200:
*         description: unfavorite successfully
*/
router.delete('/unfavorite/', unFavorite);

module.exports = router;
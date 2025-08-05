const express = require('express');
const {
    GettingAllPGroup
} = require('../controller/pgroup-controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ProductGroup
 *   description: This Tag use for ProductGroup in the application.
 */

/**
* @swagger
* /api/app/product-group/pgroup:
*   get:
*     tags: [ProductGroup]
*     summary: Getting all ProductGroup
*     responses:
*       200:
*         description: Getting all ProductGroup successfully
*/
router.get('/pgroup', GettingAllPGroup);

module.exports = router;
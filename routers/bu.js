const express = require('express');
const router = express.Router();
const {
    createNewBu,
    findBUs,
    findBUbyId,
    updateBu,
    deleteBU,
    gettingCompanyAndBu
} = require('../controller/bu-controller');

/**
 * @swagger
 * tags:
 *   name: BusinessUnit
 *   description: This Tag use for Business Unit in the admin site.
 */

/**
* @swagger
* components:
*   schemas:
*     BUComponent:
*       type: object
*       properties:
*         name:
*           type: string
*           description: to use for a creating name to database.
*         description:
*           type: string
*           description: to use for a creating description to database.
*         Active:
*           type: boolean
*           description: Set Active
*/

/**
* @swagger
* /api/bumanagement/businessunit:
*   post:
*     tags: [BusinessUnit]
*     summary: Getting all Notes
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/BUComponent'
*     responses:
*       200:
*         description: Getting all Notes successfully
*/
router.post('/businessunit', createNewBu);

/**
* @swagger
* /api/bumanagement/businessunit:
*   get:
*     tags: [BusinessUnit]
*     summary: Getting all BusinessUnit
*     responses:
*       200:
*         description: Getting all Business Unit successfully
*/
router.get('/businessunit', findBUs);

/**
* @swagger
* /api/bumanagement/company_bu:
*   get:
*     tags: [BusinessUnit]
*     summary: Getting all company and bu
*     responses:
*       200:
*         description: Getting all company and bu successfully
*/
router.get('/company_bu', gettingCompanyAndBu);

/**
* @swagger
* /api/bumanagement/businessunit/{buid}:
*   get:
*     tags: [BusinessUnit]
*     summary: Getting Business Unit By ID.
*     parameters:
*       - in: path
*         name: buid
*         required: true
*         description: The ID of the business unit to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: Getting all Business Unit successfully
*/
router.get('/businessunit/:buid', findBUbyId);

/**
* @swagger
* /api/bumanagement/businessunit/{buid}:
*   put:
*     tags: [BusinessUnit]
*     summary: Updating a Business Unit
*     parameters:
*       - in: path
*         name: buid
*         required: true
*         description: The ID of the Business Unit to getting
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/BUComponent'
*     responses:
*       200:
*         description: Business Unit Updated Success
*/
router.put('/businessunit/:buid', updateBu);

/**
* @swagger
* /api/bumanagement/businessunit/{buid}:
*   delete:
*     tags: [BusinessUnit]
*     summary: Deleting a BusinessUnit Note
*     parameters:
*       - in: path
*         name: buid
*         required: true
*         description: The ID of the business unit to deleting
*         schema:
*           type: string
*     responses:
*       200:
*         description: deleting a business unit successfully
*/
router.delete('/businessunit/:buid', deleteBU);

module.exports = router;
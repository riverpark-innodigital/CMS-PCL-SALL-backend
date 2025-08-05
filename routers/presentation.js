const express = require('express');
const router = express.Router();
const upload = require('../hooks/multer');
const {
    createPresentationFile,
} = require('../controller/presentation-controller');

/**
 * @swagger
 * tags:
 *   name: Presentation
 *   description: Presentation Management
 */

/**
 * @swagger
 * /api/presentation/presentationFile:
 *   post:
 *     tags: [Presentation]
 *     summary: Create a new presentation file
 *     description: Creates a new presentation file.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               ProductId:
 *                 type: integer
 *                 example: 2
 *               presentFile:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 required: false
 *     responses:
 *        201:
 *          description: Presentation files created
 */
router.post('/presentationFile', upload.fields([
        { name: 'presentFile', maxCount: 10 }
    ]), 
    createPresentationFile
);

module.exports = router;
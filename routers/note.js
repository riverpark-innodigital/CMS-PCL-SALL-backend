const express = require('express');
const router = express.Router();
const {
    createNewNote,
    gettingAllNotes,
    gettingNoteByID,
    updateNote,
    deleteNote,
    gettingNoteByProduct,
} = require('../controller/note-controller');

/**
 * @swagger
 * tags:
 *   name: Note
 *   description: This Tag use for Note in the sale app.
 */

/**
* @swagger
* components:
*   schemas:
*     NoteUpdateComponent:
*       type: object
*       properties:
*         PresentToEN:
*           type: string
*           description: to use for a creating PresentToEN en languages.
*         PresentDate:
*           type: string
*           example: 2025-01-05
*           description: to use for a creating PresentDate.
*         DescriptionEN:
*           type: string
*           example: DescriptionEN
*           description: to use for a creating DescriptionEN.
*         ProductID:
*           type: integer
*           example: 1
*           description: to use for a relation with ProductID.

*     NoteComponent:
*       type: object
*       allOf:
*         - $ref: '#/components/schemas/NoteUpdateComponent'
*/

/**
* @swagger
* /api/notemanagement/note:
*   get:
*     tags: [Note]
*     summary: Getting all Notes
*     responses:
*       200:
*         description: Getting all Notes successfully
*/
router.get('/note', gettingAllNotes);

/**
* @swagger
* /api/notemanagement/note/{NoteID}:
*   get:
*     tags: [Note]
*     summary: Getting Note By ID.
*     parameters:
*       - in: path
*         name: NoteID
*         required: true
*         description: The ID of the Note to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: Getting all Note successfully
*/
router.get('/note/:NoteID', gettingNoteByID);

/**
* @swagger
* /api/notemanagement/note:
*   post:
*     tags: [Note]
*     summary: Create a new Note
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/NoteComponent'
*     responses:
*       201:
*         description: Note Created Success
*/
router.post('/note', createNewNote);

/**
* @swagger
* /api/notemanagement/note/{NoteID}:
*   put:
*     tags: [Note]
*     summary: Updating a Note
*     parameters:
*       - in: path
*         name: NoteID
*         required: true
*         description: The ID of the Note to getting
*         schema:
*           type: string
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/NoteUpdateComponent'
*     responses:
*       200:
*         description: Group Note Updated Success
*/
router.put('/note/:NoteID', updateNote);

/**
* @swagger
* /api/notemanagement/GettingNoteByID/{ProductID}:
*   get:
*     tags: [Note]
*     summary: Getting Note By ID.
*     parameters:
*       - in: path
*         name: ProductID
*         required: true
*         description: The ID of the Note to getting
*         schema:
*           type: string
*     responses:
*       200:
*         description: Getting all Note successfully
*/
router.get('/GettingNoteByID/:ProductID', gettingNoteByProduct);

/**
* @swagger
* /api/notemanagement/note/{NoteID}:
*   delete:
*     tags: [Note]
*     summary: deleting Note
*     parameters:
*       - in: path
*         name: NoteID
*         required: true
*         description: The ID of the Note to deleting
*         schema:
*           type: string
*     responses:
*       200:
*         description: deleting a Note successfully
*/
router.delete('/note/:NoteID', deleteNote);

module.exports = router;
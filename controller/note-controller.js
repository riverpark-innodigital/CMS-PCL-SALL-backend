const { PrismaClient } = require('@prisma/client');
const sendResponse = require('../hooks/sendResponse');
const handleError = require('../hooks/handleError');
const DecryptToken = require('../hooks/decryptJWT');

const prisma = new PrismaClient();

exports.createNewNote = async (req, res) => {
    try {
        const { PresentToEN, PresentDate, DescriptionEN, ProductID } = req.body;
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;

        const createNewNote = await prisma.notes.create({
            data: {
                PresentToEN: PresentToEN,
                PresentDate: new Date(PresentDate),
                DescriptionEN: DescriptionEN,
                ProductID: Number(ProductID),
                CreateBy: UserData,
                UpdateBy: UserData,
            }
        });

        if (!createNewNote) throw "Creating a new note failed.";

        return sendResponse(res, "Creating a new note successfully!", createNewNote, 201);
    } catch (error) {
        return handleError(res, "Creating new note failed", error, 500);
    }
};

exports.gettingAllNotes = async (req, res) => {
    try {
        const response = await prisma.notes.findMany({});

        return sendResponse(res, "Getting all notes successfully completed", response, 200);
    } catch (error) {
        return handleError(res, "Getting all notes failed", error, 500);
    }
};

exports.gettingNoteByID = async (req, res) => {
    try {
        const { NoteID } = req.params;

        const response = await prisma.notes.findUnique({
            where: {
                noteID: Number(NoteID),
            }
        });

        return sendResponse(res, "Getting a note successfully completed!", response, 200);
    } catch (error) {
        return handleError(res, "Getting notes by ID failed", error, 500);
    }
};

exports.updateNote = async (req, res) => {
    try {
        const { PresentToEN, PresentDate, DescriptionEN, ProductID } = req.body;
        const { NoteID } = req.params;
        const user = await DecryptToken(req);
        const UserData = user.user.fullname;

        const reCheckNote = await prisma.notes.findFirst({
            where: {
                noteID: Number(NoteID),
            }
        });

        if (!reCheckNote) throw "Note not found in the system.";

        const updatedNote = await prisma.notes.update({
            where: {
                noteID: Number(NoteID),
            },
            data: {
                PresentToEN: PresentToEN ? PresentToEN : reCheckNote.PresentToEN,
                PresentDate: PresentDate ? new Date(PresentDate) : reCheckNote.PresentDate,
                DescriptionEN: DescriptionEN ? DescriptionEN : reCheckNote.DescriptionEN,
                ProductID: ProductID ? Number(ProductID) : reCheckNote.ProductID,
                UpdateBy: UserData,
            }
        });

        return sendResponse(res, "Updating a note successfully completed!", updatedNote, 200);
    } catch (error) {
        return handleError(res, "Updating a note failed", error, 500);
    }
};

exports.deleteNote = async (req, res) => {
    try {
        const { NoteID } = req.params;

        const reCheckNote = await prisma.notes.findFirst({
            where: {
                noteID: Number(NoteID),
            },
        });

        if (!reCheckNote) throw "Note not found in the system.";

        const deletedNote = await prisma.notes.delete({
            where: {
                noteID: Number(NoteID),
            },
        });

        return sendResponse(res, "Deleting a note successfully completed!", deletedNote, 200);
    } catch (error) {
        return handleError(res, "Delete a note failed", error, 500);
    }
};

exports.gettingNoteByProduct = async (req, res) => {
    try {
        const { ProductID } = req.params;

        const getPrdouct = await prisma.notes.findFirst({
            where: {
                ProductID: Number(ProductID),
            }
        });

        const Notedata = await prisma.notes.findMany({
            where: {
                ProductID: Number(ProductID),
            },
            select: {
                noteID: true,
                PresentToEN: true,
                PresentDate: true,
                DescriptionEN: true,
                CreateBy: true,
                CreateDate: true,
                UpdateBy: true,
                UpdateDate: true,
                ProductID: true,
            }
        });

        const response = {
            Prodoct: getPrdouct,
            Notes: Notedata,
        }

        return sendResponse(res, "Getting notes by product successfully completed!", response, 200);
    } catch (error) {
        return handleError(res, "Getting notes by product failed", error, 500);
    }
}


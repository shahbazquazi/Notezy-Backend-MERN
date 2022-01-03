const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchuser');
const Notes = require('../models/Notes');
const { body, validationResult } = require('express-validator');

//Route 1: Get all the notes using: GET "/api/notes/fetchallnotes"- login required
router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);

    } catch (error) {
        console.log({ error: error.message });
        res.status(500).send("Internal Server Error");
    }
});

//Route 2: Add a new note using: POST "/api/notes/addnote"- login required
router.post('/addnote', fetchUser, [body('title', 'The title must be of 3 letters').isLength({ min: 3 }), body('description', 'The description must be of 5 letters').isLength({ min: 5 })], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //showing error for wrong request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array() });
        }
        //Add a note
        const note = new Notes({
            title,
            description,
            tag,
            user: req.user.id
        });
        const saveNote = await note.save();
        res.json(saveNote);
    } catch (error) {
        console.log({ error: error.message });
        res.status(500).send("Internal Server Error");
    }
});

//Route 3: Update an existing note using: PUT "/api/notes/updatenote/:id"- login required
router.put('/updatenote/:id', fetchUser, async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        //Create new note object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        // Find the note which you want to update and update it 
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });
        res.json(note);
    } catch (error) {
        console.log({ error: error.message });
        res.status(500).send("Internal Server Error");
    }
});

//Route 4: Delete an existing note using: DELETE "/api/notes/deletenote/:id"- login required
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
    try {
        // Find the note which you want to update and update it 
        let note = await Notes.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found");
        }
        //Allow deletion only if note is belongs to the user
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed")
        }
        note = await Notes.findByIdAndDelete(req.params.id);
        res.json({ "success": "Note has been deleted", note: note });
    } catch (error) {
        console.log({ error: error.message });
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
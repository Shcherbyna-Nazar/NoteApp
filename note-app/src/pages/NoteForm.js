// NoteForm.js
import React, {useCallback, useRef, useState} from 'react';
import { Box, Button, Checkbox, FormControlLabel, TextField, Typography, Paper } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

const NoteForm = ({ onSave, initialNote }) => {
    const [note, setNote] = useState({ ...initialNote, isEncrypted: false, password: '' });

    const handleChange = (event) => {
        setNote({ ...note, [event.target.name]: event.target.value });
    };

    const handleContentChange = (content) => {
        setNote({ ...note, content });
    };

    const handleEncryptionChange = (event) => {
        setNote({ ...note, isEncrypted: event.target.checked });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const sanitizedContent = DOMPurify.sanitize(note.content);
        onSave({ ...note, content: sanitizedContent });
    };

    const editorStyles = {
        '& .ql-editor img': {
            maxWidth: '200px',
            maxHeight: '200px'
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { mb: 2 }, '& .quill': { mb: 2 } }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Edit Note</Typography>
                <TextField
                    name="title"
                    label="Title"
                    value={note.title}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                <ReactQuill
                    value={note.content}
                    onChange={handleContentChange}
                    theme="snow"
                    modules={{
                        toolbar: [
                            ['bold', 'italic', 'underline', 'strike'],
                            ['blockquote', 'code-block'],
                            [{ 'header': 1 }, { 'header': 2 }],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'script': 'sub'}, { 'script': 'super' }],
                            [{ 'indent': '-1'}, { 'indent': '+1' }],
                            [{ 'direction': 'rtl' }],
                            [{ 'size': ['small', false, 'large', 'huge'] }],
                            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                            [{ 'color': [] }, { 'background': [] }],
                            [{ 'font': [] }],
                            [{ 'align': [] }],
                            ['clean'],
                            ['link', 'image', 'video']
                        ]
                    }}
                    sx={{ mb: 2, ...editorStyles }}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={note.isEncrypted}
                            onChange={handleEncryptionChange}
                            name="isEncrypted"
                        />
                    }
                    label="Encrypt Note"
                    sx={{ mb: 2 }}
                />
                {note.isEncrypted && (
                    <TextField
                        name="password"
                        label="Encryption Password"
                        type="password"
                        value={note.password}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                )}
                <Button type="submit" variant="contained" color="primary">
                    Save
                </Button>
            </Box>
        </Paper>
    );
};

export default NoteForm;

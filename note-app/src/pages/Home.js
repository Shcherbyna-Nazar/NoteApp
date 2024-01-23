import React, {useState, useEffect, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper
} from '@mui/material';
import CustomAppBar from '../CustomAppBar';
import NoteList from './NoteList';
import NoteForm from './NoteForm';
import apiClient from "../apiClient";

const Home = () => {

    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [publicNotes, setPublicNotes] = useState([]);
    const [editingNote, setEditingNote] = useState({title: '', content: '', isEncrypted: false});
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    const isAuthenticated = () => {
        return localStorage.getItem('accessToken') !== null;
    };

    const getUserEmailFromToken = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.sub;
    };

    const loadNotes = useCallback(async () => {
        try {
            const response = await apiClient.get('/notes');
            setNotes(response.data);
        } catch (error) {
            console.error('Error loading notes', error);
        }
    }, []);

    const loadPublicNotes = useCallback(async () => {
        try {
            const response = await apiClient.get('/notes/public');
            setPublicNotes(response.data);
        } catch (error) {
            console.error('Error loading public notes', error);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated()) {
            loadNotes();
            loadPublicNotes();
        } else {
            navigate('/login');
        }
    }, [loadNotes, loadPublicNotes, navigate]);

    const saveNote = async (note) => {
        try {
            const email = getUserEmailFromToken();
            if (!email) {
                throw new Error('User email is not available');
            }
            note.id
                ? await apiClient.put(`/notes/${note.id}`, note)
                : await apiClient.post('/notes', note);
            loadNotes();
            setShowNoteForm(false);
        } catch (error) {
            console.error('Error saving note', error);
        }
    };

    const handleDelete = (noteId) => {
        setNoteToDelete(noteId);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        try {
            await apiClient.delete(`/notes/${noteToDelete}`);
            loadNotes();
            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting note', error);
        }
    };

    const handleNewNoteClick = () => {
        setEditingNote({title: '', content: '', isEncrypted: false});
        setShowNoteForm(true);
    };

    const handleEditNote = async (note) => {
        if (note.isEncrypted) {
            const password = prompt('Please enter the password to decrypt the note:');
            if (password) {
                try {
                    const response = await apiClient.get(`/notes/decrypt/${note.id}`, {
                        params: {password},
                    });
                    setEditingNote({...note, content: response.data});
                    setShowNoteForm(true);
                } catch (error) {
                    console.error('Error decrypting note', error);
                    alert('Incorrect password or error decrypting the note.');
                }
            }
        } else {
            setEditingNote(note);
            setShowNoteForm(true);
        }
    };

    const handleViewNote = (noteId) => {
        navigate(`/note/${noteId}`);
    };

    return (
        <>
            <CustomAppBar/>
            <Container maxWidth="lg">
                <Box sx={{my: 4}}>
                    <Typography variant="h4" component="h1" gutterBottom>Welcome to the Note App</Typography>
                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 2}}>
                        <Button variant="contained" color="primary" onClick={handleNewNoteClick}>
                            Create New Note
                        </Button>
                    </Box>
                    {showNoteForm && <NoteForm onSave={saveNote} initialNote={editingNote}/>}
                    <Paper sx={{my: 2, p: 2}}>
                        <Typography variant="h6">Your Notes</Typography>
                        <NoteList
                            notes={notes}
                            onEdit={handleEditNote}
                            onDelete={handleDelete}
                            onView={handleViewNote}
                        />
                    </Paper>
                    <Paper sx={{p: 2}}>
                        <Typography variant="h6">Public Notes</Typography>
                        <NoteList
                            notes={publicNotes}
                            onView={handleViewNote}
                        />
                    </Paper>
                </Box>
            </Container>
            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Note</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this note? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={confirmDelete} color="secondary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Home;

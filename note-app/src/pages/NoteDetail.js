import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    IconButton,
    TextField,
    Switch,
    FormControlLabel,
    Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import NoteForm from './NoteForm';
import DOMPurify from 'dompurify';
import apiClient from "../apiClient";

const NoteDetail = () => {
    const navigate = useNavigate();
    const {noteId} = useParams();
    const [note, setNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [openDecryptDialog, setOpenDecryptDialog] = useState(false);
    const [password, setPassword] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        fetchNote();
        setUserEmail(getUserEmailFromToken());
    }, [noteId]);

    const fetchNote = async () => {
        try {
            const response = await apiClient.get(`http://localhost:8080/api/v1/notes/${noteId}`);
            setNote(response.data);
            if (response.data.isEncrypted) {
                setOpenDecryptDialog(true);
            }
        } catch (error) {
            console.error('Error fetching note', error);
        }
    };

    const handleDecrypt = async () => {
        try {
            const response = await apiClient.get(`/notes/decrypt/${noteId}`, {
                params: {password},
            });
            setNote({...note, content: response.data, isEncrypted: false});
            setOpenDecryptDialog(false);
        } catch (error) {
            console.error('Error decrypting note', error);
            alert('Incorrect password or error decrypting the note.');
        }
    };

    const handleDelete = async () => {
        try {
            await apiClient.delete(`/notes/${noteId}`);
            navigate('/');
        } catch (error) {
            console.error('Error deleting note', error);
        }
    };

    const handleMakePublicPrivate = async () => {
        try {
            const endpoint = note.isPublic
                ? `/notes/${noteId}/make-private`
                : `/notes/${noteId}/make-public`;
            await apiClient.post(endpoint, {},);
            fetchNote();
        } catch (error) {
            console.error('Error changing note public status', error);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const getUserEmailFromToken = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.sub;
    };

    const handleSave = async (editedNote) => {
        try {
            const email = getUserEmailFromToken();
            if (!email) {
                throw new Error('User email is not available');
            }
            await apiClient.put(`/notes/${noteId}`, editedNote, {
                params: {email}
            });
            setIsEditing(false);
            fetchNote();
        } catch (error) {
            console.error('Error saving note', error);
        }
    };

    const isOwner = () => {
        return note && note.owner.email === userEmail;
    };

    if (!note) return <div>Loading...</div>;

    const createMarkup = (htmlContent) => {
        const sanitizedContent = DOMPurify.sanitize(htmlContent);
        return {__html: sanitizedContent};
    };

    return (
        <Container maxWidth="md">
            <Box sx={{my: 4}}>
                {isEditing ? (
                    <NoteForm onSave={handleSave} initialNote={note}/>
                ) : (
                    <>
                        <Grid container justifyContent="space-between" alignItems="center">
                            <Grid item>
                                <Typography variant="h5" component="h2">{note.title}</Typography>
                            </Grid>
                            <Grid item>
                                <Box>
                                    {isOwner() && (
                                        <>
                                            <IconButton onClick={handleEdit} color="primary">
                                                <EditIcon/>
                                            </IconButton>
                                            <IconButton onClick={handleDelete} color="secondary">
                                                <DeleteIcon/>
                                            </IconButton>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={note.isPublic}
                                                        onChange={handleMakePublicPrivate}
                                                        color="primary"
                                                    />
                                                }
                                                label={note.isPublic ? "Public" : "Private"}
                                            />
                                        </>
                                    )}
                                    {!isOwner() && (
                                        note.isPublic ? <PublicIcon color="action"/> : <LockIcon color="action"/>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                        {note.isEncrypted ? (
                            <Typography variant="body1">This note is encrypted. Please decrypt to view the
                                content.</Typography>
                        ) : (
                            <div dangerouslySetInnerHTML={createMarkup(note.content)}/>
                        )}
                        <Dialog open={openDecryptDialog} onClose={() => setOpenDecryptDialog(false)}>
                            <DialogTitle>Decrypt Note</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    This note is encrypted. Please enter the password to decrypt it.
                                </DialogContentText>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id="password"
                                    label="Password"
                                    type="password"
                                    fullWidth
                                    variant="standard"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={() => setOpenDecryptDialog(false)} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={handleDecrypt} color="secondary">
                                    Decrypt
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )}
            </Box>
        </Container>
    );
};

export default NoteDetail;

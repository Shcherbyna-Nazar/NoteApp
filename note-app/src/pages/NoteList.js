import React from 'react';
import {List, ListItem, ListItemText, IconButton, ListItemIcon} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LockIcon from '@mui/icons-material/Lock';
import {Link} from 'react-router-dom';

const NoteList = ({notes, onDelete}) => {
    const getUserEmailFromToken = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        return payload.sub;
    };

    const currentUserEmail = getUserEmailFromToken();

    return (
        <List>
            {notes.map(note => (
                <ListItem
                    key={note.id}
                    secondaryAction={
                        <>
                            {note.isEncrypted && (
                                <ListItemIcon>
                                    <LockIcon/>
                                </ListItemIcon>
                            )}
                            <IconButton edge="end" component={Link} to={`/note/${note.id}`}>
                                <VisibilityIcon/>
                            </IconButton>
                            {onDelete && (
                                <IconButton edge="end" onClick={() => onDelete(note.id)}>
                                    <DeleteIcon/>
                                </IconButton>
                            )}
                        </>
                    }
                >
                    <ListItemText
                        primary={note.title}
                        secondary={note.isPublic && note.owner && note.owner.email !== currentUserEmail ? `Owner: ${note.owner.firstname} ${note.owner.lastname}` : null}
                    />
                </ListItem>
            ))}
        </List>
    );
};

export default NoteList;

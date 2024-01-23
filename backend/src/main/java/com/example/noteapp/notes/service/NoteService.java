package com.example.noteapp.notes.service;

import com.example.noteapp.notes.model.Note;
import com.example.noteapp.notes.other.NoteAddRequest;
import com.example.noteapp.notes.repository.NoteRepository;
import com.example.noteapp.notes.crypto.EncryptionUtils;
import com.example.noteapp.user.User;
import com.example.noteapp.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NoteService {
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    @Autowired
    public NoteService(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    public List<Note> getAllNotesByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        return noteRepository.findByOwnerId(user.getId());
    }

    public Note getNoteById(Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new EntityNotFoundException("Note not found"));
        return note;
    }

    public Note saveNote(NoteAddRequest noteRequest, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        String content = noteRequest.getContent();
        if (noteRequest.getIsEncrypted()) {
            try {
                content = EncryptionUtils.encrypt(content, noteRequest.getPassword());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        Note newNote = Note.builder()
                .title(noteRequest.getTitle())
                .content(content)
                .isEncrypted(noteRequest.getIsEncrypted())
                .isPublic(false)
                .password(noteRequest.getPassword())
                .owner(user)
                .build();
        return noteRepository.save(newNote);
    }

    public Note updateNoteById(Long noteId, NoteAddRequest noteRequest, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        String content = noteRequest.getContent();
        if (noteRequest.getIsEncrypted()) {
            try {
                content = EncryptionUtils.encrypt(content, noteRequest.getPassword());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        Note noteToUpdate = noteRepository.findById(noteId)
                .orElseThrow(() -> new EntityNotFoundException("Note not found"));
        noteToUpdate.setTitle(noteRequest.getTitle());
        noteToUpdate.setContent(content);
        noteToUpdate.setIsEncrypted(noteRequest.getIsEncrypted());
        noteToUpdate.setPassword(noteRequest.getPassword());
        return noteRepository.save(noteToUpdate);
    }

    public void deleteNote(Long noteId) {
        noteRepository.deleteById(noteId);
    }

    public Note makeNotePublic(Long noteId) {
        Note note = getNoteById(noteId);
        note.setIsPublic(true);
        return noteRepository.save(note);
    }

    public Note makeNotePrivate(Long noteId) {
        Note note = getNoteById(noteId);
        note.setIsPublic(false);
        return noteRepository.save(note);
    }

    public List<Note> getAllPublicNotes() {
        return noteRepository.findByIsPublicTrue();
    }

    public String decryptNoteContent(Long id, String password) {
        Note note = getNoteById(id);
        if (!note.getIsEncrypted()) {
            throw new RuntimeException("Note is not encrypted");
        }
        try {
            return EncryptionUtils.decrypt(note.getContent(), password);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

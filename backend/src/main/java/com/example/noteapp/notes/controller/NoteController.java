package com.example.noteapp.notes.controller;

import com.example.noteapp.notes.model.Note;
import com.example.noteapp.notes.other.NoteAddRequest;
import com.example.noteapp.notes.service.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/notes")
public class NoteController {
    private final NoteService noteService;

    @Autowired
    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @GetMapping
    public ResponseEntity<List<Note>> getAllNotesByUser(Principal principal) {
        String email = principal.getName();
        return ResponseEntity.ok(noteService.getAllNotesByUser(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.getNoteById(id));
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody NoteAddRequest note, Principal principal) {
        String email = principal.getName();
        return ResponseEntity.ok(noteService.saveNote(note, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody NoteAddRequest note, Principal principal) {
        String email = principal.getName();
        return ResponseEntity.ok(noteService.updateNoteById(id, note, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/make-public")
    public ResponseEntity<Note> makeNotePublic(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.makeNotePublic(id));
    }

    @PostMapping("/{id}/make-private")
    public ResponseEntity<Note> makeNotePrivate(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.makeNotePrivate(id));
    }

    @GetMapping("/public")
    public ResponseEntity<List<Note>> getAllPublicNotes() {
        return ResponseEntity.ok(noteService.getAllPublicNotes());
    }

    @GetMapping("/decrypt/{id}")
    public ResponseEntity<String> decryptNoteContent(@PathVariable Long id, @RequestParam String password) {
        return ResponseEntity.ok(noteService.decryptNoteContent(id, password));
    }
}

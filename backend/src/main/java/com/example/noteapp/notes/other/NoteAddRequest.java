package com.example.noteapp.notes.other;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Builder
@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class NoteAddRequest {
    private String title;
    private String content;
    private Boolean isEncrypted;
    private String password;
}

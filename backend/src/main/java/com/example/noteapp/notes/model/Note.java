package com.example.noteapp.notes.model;

import com.example.noteapp.user.User;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notes")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Data
@Builder
public class Note {
    @Id
    @GeneratedValue
    private Long id;

    private String title;
    @Column(columnDefinition = "TEXT")
    private String content;
    private Boolean isEncrypted;
    private Boolean isPublic = false;
    private String password;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", referencedColumnName = "id", nullable = false)
    private User owner;

}

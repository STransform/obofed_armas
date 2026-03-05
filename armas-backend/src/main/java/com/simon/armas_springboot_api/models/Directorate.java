package com.simon.armas_springboot_api.models;

import java.util.List;
import java.util.UUID;
import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "directorate")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Directorate {

    @Id
    private String id;

    private String directoratename;
    private String telephone;
    private String email;

    @OneToMany(mappedBy = "directorate")
    @JsonManagedReference
    private List<Document> documents;

   

     public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDirectoratename() {
        return directoratename;
    }

    public void setDirectoratename(String directoratename) {
        this.directoratename = directoratename;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<Document> getDocuments() {
        return documents;
    }

    public void setDocuments(List<Document> documents) {
        this.documents = documents;
    }

    // Generate UUID manually if not set
    @PrePersist
    public void ensureId() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
    }

    @Override
    public String toString() {
        return "Directorate [id=" + id + ", directoratename=" + directoratename +
                ", telephone=" + telephone + ", email=" + email + "]";
    }
}

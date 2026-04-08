package org.example.DTO;

public class Usuarios {
    private int id;
    private String username;
    private String passwordHash;
    private String nombreCompleto;
    private RolUsuario rol;

    public Usuarios(int id, String username, String passwordHash, String nombreCompleto, RolUsuario rol) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.nombreCompleto = nombreCompleto;
        this.rol = rol;
    }

    public Usuarios(String username, String passwordHash, String nombreCompleto, RolUsuario rol) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.nombreCompleto = nombreCompleto;
        this.rol = rol;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public RolUsuario getRol() {
        return rol;
    }

    public void setRol(RolUsuario rol) {
        this.rol = rol;
    }

    @Override
    public String toString() {
        return "Usuarios{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", passwordHash='" + passwordHash + '\'' +
                ", nombreCompleto='" + nombreCompleto + '\'' +
                ", rol='" + rol + '\'' +
                '}';
    }
}

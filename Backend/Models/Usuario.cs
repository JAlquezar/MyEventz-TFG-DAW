using System;
using System.Collections.Generic;

namespace MyEventz.API.Models
{
    public class Usuario
    {
        public string Id { get; set; } = null!; // Firebase UID
        public string NombreCompleto { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateTime? FechaNacimiento { get; set; }
        public string? Biografia { get; set; }
        public string? Instagram { get; set; }
        public string? X { get; set; }
        public string? YouTube { get; set; }
        public string? TikTok { get; set; }
        public string? FotoPerfil { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int Reputacion { get; set; } = 100;
        public DateTime? PenalizadoHasta { get; set; }

        public ICollection<Evento> EventosOrganizados { get; set; } = new List<Evento>();
        public ICollection<UsuarioHobby> Hobbies { get; set; } = new List<UsuarioHobby>();
        public ICollection<ParticipanteEvento> EventosParticipados { get; set; } = new List<ParticipanteEvento>();
    }
}

using System;
using System.Collections.Generic;

namespace MyEventz.API.Models
{
    public class Evento
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = null!;
        public DateTime FechaRealizacion { get; set; }
        public string? Descripcion { get; set; }
        public int? RangoEdadMin { get; set; }
        public int? RangoEdadMax { get; set; }
        public string Ubicacion { get; set; } = null!;
        public int? NumMaxParticipantes { get; set; }
        public string OrganizadorId { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Usuario Organizador { get; set; } = null!;
        public ICollection<EventoCategoria> Categorias { get; set; } = new List<EventoCategoria>();
        public ICollection<ParticipanteEvento> Participantes { get; set; } = new List<ParticipanteEvento>();
    }
}

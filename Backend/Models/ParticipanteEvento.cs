using System;

namespace MyEventz.API.Models
{
    public class ParticipanteEvento
    {
        public string UsuarioId { get; set; } = null!;
        public Usuario Usuario { get; set; } = null!;

        public int EventoId { get; set; }
        public Evento Evento { get; set; } = null!;

        public DateTime FechaInscripcion { get; set; } = DateTime.UtcNow;
        public bool? Asistio { get; set; }
    }
}

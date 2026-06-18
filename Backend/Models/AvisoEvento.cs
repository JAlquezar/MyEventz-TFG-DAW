using System;

namespace MyEventz.API.Models
{
    public class AvisoEvento
    {
        public int Id { get; set; }
        public int EventoId { get; set; }
        public string Titulo { get; set; } = null!;
        public string Contenido { get; set; } = null!;
        public DateTime FechaPublicacion { get; set; } = DateTime.UtcNow;

        public Evento Evento { get; set; } = null!;
    }
}

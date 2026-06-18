using System;

namespace MyEventz.API.Models
{
    public class SoporteTicket
    {
        public int Id { get; set; }
        public string? UsuarioId { get; set; }
        public string Email { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string Categoria { get; set; } = null!;
        public string Asunto { get; set; } = null!;
        public string Mensaje { get; set; } = null!;
        public DateTime FechaCreado { get; set; } = DateTime.UtcNow;

        public Usuario? Usuario { get; set; }
    }
}

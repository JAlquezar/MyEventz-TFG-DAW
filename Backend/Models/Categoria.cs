using System.Collections.Generic;

namespace MyEventz.API.Models
{
    public class Categoria
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;

        public ICollection<UsuarioHobby> Usuarios { get; set; } = new List<UsuarioHobby>();
        public ICollection<EventoCategoria> Eventos { get; set; } = new List<EventoCategoria>();
    }
}

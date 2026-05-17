namespace MyEventz.API.Models
{
    public class UsuarioHobby
    {
        public string UsuarioId { get; set; } = null!;
        public Usuario Usuario { get; set; } = null!;

        public int CategoriaId { get; set; }
        public Categoria Categoria { get; set; } = null!;
    }
}

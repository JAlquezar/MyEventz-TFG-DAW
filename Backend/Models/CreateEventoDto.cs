namespace MyEventz.API.Models
{
    /// <summary>
    /// DTO for creating/updating an event — avoids EF navigation property conflicts
    /// </summary>
    public class CreateEventoDto
    {
        public string Titulo { get; set; } = null!;
        public DateTime FechaRealizacion { get; set; }
        public string? Descripcion { get; set; }
        public int? RangoEdadMin { get; set; }
        public int? RangoEdadMax { get; set; }
        public string Ubicacion { get; set; } = null!;
        public int? NumMaxParticipantes { get; set; }
        public List<int> CategoriaIds { get; set; } = new();
    }
}

namespace MyEventz.API.Models
{
    /// <summary>
    /// DTO for updating user profile — avoids EF model validation issues with navigation properties
    /// </summary>
    public class UpdateUserDto
    {
        public string? NombreCompleto { get; set; }
        public string? Username { get; set; }
        public string? Biografia { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        public string? Instagram { get; set; }
        public string? X { get; set; }
        public string? YouTube { get; set; }
        public string? TikTok { get; set; }
        public string? FotoPerfil { get; set; }
        public List<int> HobbyIds { get; set; } = new();
    }
}

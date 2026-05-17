namespace MyEventz.API.Models
{
    /// <summary>
    /// DTO for creating a new user (registration)
    /// </summary>
    public class CreateUserDto
    {
        public string Id { get; set; } = null!;           // Firebase UID
        public string NombreCompleto { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public DateTime? FechaNacimiento { get; set; }
        public string? Biografia { get; set; }
    }
}

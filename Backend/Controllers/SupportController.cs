using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyEventz.API.Data;
using MyEventz.API.Models;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MyEventz.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SupportController(AppDbContext context)
        {
            _context = context;
        }

        // POST /api/support
        [HttpPost]
        [AllowAnonymous] // Allow guests/non-authenticated users to send support requests from landing
        public async Task<IActionResult> SubmitTicket([FromBody] CreateTicketDto dto)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var ticket = new SoporteTicket
            {
                UsuarioId = string.IsNullOrEmpty(firebaseUid) ? null : firebaseUid,
                Email = dto.Email,
                Nombre = dto.Nombre,
                Categoria = dto.Categoria,
                Asunto = dto.Asunto,
                Mensaje = dto.Mensaje,
                FechaCreado = DateTime.UtcNow
            };

            _context.SoporteTickets.Add(ticket);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Su mensaje ha sido enviado con éxito. Nos pondremos en contacto a la brevedad." });
        }
    }

    public class CreateTicketDto
    {
        public string Email { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string Categoria { get; set; } = null!; // "Fallo técnico", "Sugerencia", "Reportar usuario", "Otro"
        public string Asunto { get; set; } = null!;
        public string Mensaje { get; set; } = null!;
    }
}

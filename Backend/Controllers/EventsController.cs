using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyEventz.API.Data;
using MyEventz.API.Models;
using System.Security.Claims;

namespace MyEventz.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EventsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public EventsController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/events?category=id
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetEvents([FromQuery] int? category)
        {
            var query = _context.Eventos.AsQueryable();

            if (category.HasValue)
                query = query.Where(e => e.Categorias.Any(c => c.CategoriaId == category.Value));

            var result = await query
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new
                {
                    e.Id,
                    e.Titulo,
                    e.FechaRealizacion,
                    e.Ubicacion,
                    e.CreatedAt,
                    Participantes = e.Participantes.Select(p => new { p.UsuarioId }).ToList(),
                    Categorias = e.Categorias.Select(c => new { Categoria = new { c.Categoria.Id, c.Categoria.Nombre } }).ToList(),
                    Organizador = new { e.Organizador.Id, e.Organizador.NombreCompleto, e.Organizador.Username }
                }).ToListAsync();

            return Ok(result);
        }

        // GET /api/events/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetEvent(int id)
        {
            var evento = await _context.Eventos
                .Where(e => e.Id == id)
                .Select(e => new
                {
                    e.Id,
                    e.Titulo,
                    e.FechaRealizacion,
                    e.Descripcion,
                    e.RangoEdadMin,
                    e.RangoEdadMax,
                    e.Ubicacion,
                    e.NumMaxParticipantes,
                    e.OrganizadorId,
                    e.CreatedAt,
                    Categorias = e.Categorias.Select(c => new { Categoria = new { c.Categoria.Id, c.Categoria.Nombre } }).ToList(),
                    Organizador = new { e.Organizador.Id, e.Organizador.NombreCompleto, e.Organizador.Username },
                    Participantes = e.Participantes.Select(p => new
                    {
                        p.UsuarioId,
                        Usuario = new { p.Usuario.Id, p.Usuario.NombreCompleto, p.Usuario.Username }
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (evento == null) return NotFound();
            return Ok(evento);
        }

        // POST /api/events — uses DTO to avoid EF navigation property issues
        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] CreateEventoDto dto)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid))
                return Unauthorized();

            // Verify the organizer exists in our DB
            var organizador = await _context.Usuarios.FindAsync(firebaseUid);
            if (organizador == null)
                return BadRequest("Usuario no encontrado en la base de datos. Por favor completa tu registro primero.");

            // Create the event
            var evento = new Evento
            {
                Titulo = dto.Titulo,
                FechaRealizacion = dto.FechaRealizacion,
                Descripcion = dto.Descripcion,
                RangoEdadMin = dto.RangoEdadMin,
                RangoEdadMax = dto.RangoEdadMax,
                Ubicacion = dto.Ubicacion,
                NumMaxParticipantes = dto.NumMaxParticipantes,
                OrganizadorId = firebaseUid,
            };

            _context.Eventos.Add(evento);
            await _context.SaveChangesAsync(); // Get the generated ID

            // Now add category relationships
            foreach (var catId in dto.CategoriaIds)
            {
                _context.EventosCategorias.Add(new EventoCategoria
                {
                    EventoId = evento.Id,
                    CategoriaId = catId
                });
            }

            await _context.SaveChangesAsync();

            // Return full event with includes
            return await GetEvent(evento.Id);
        }

        // POST /api/events/{id}/participar
        [HttpPost("{id}/participar")]
        public async Task<IActionResult> Participar(int id)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

            var evento = await _context.Eventos.FindAsync(id);
            if (evento == null) return NotFound();

            if (evento.NumMaxParticipantes.HasValue)
            {
                var count = await _context.ParticipantesEventos.CountAsync(p => p.EventoId == id);
                if (count >= evento.NumMaxParticipantes.Value)
                    return BadRequest("El evento está lleno.");
            }

            _context.ParticipantesEventos.Add(new ParticipanteEvento { EventoId = id, UsuarioId = firebaseUid });

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateException) { return BadRequest("Ya participas en este evento."); }

            return Ok();
        }

        // DELETE /api/events/{id}/participar
        [HttpDelete("{id}/participar")]
        public async Task<IActionResult> CancelarParticipacion(int id)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

            var participacion = await _context.ParticipantesEventos
                .FirstOrDefaultAsync(p => p.EventoId == id && p.UsuarioId == firebaseUid);

            if (participacion == null) return NotFound("No participas en este evento.");

            _context.ParticipantesEventos.Remove(participacion);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}

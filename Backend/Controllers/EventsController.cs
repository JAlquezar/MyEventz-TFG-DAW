using System;
using System.Linq;
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
                    e.EsPatrocinado,
                    e.ImagenUrl,
                    Participantes = e.Participantes.Select(p => new { p.UsuarioId }).ToList(),
                    Categorias = e.Categorias.Select(c => new { Categoria = new { c.Categoria.Id, c.Categoria.Nombre } }).ToList(),
                    Organizador = new { e.Organizador.Id, e.Organizador.NombreCompleto, e.Organizador.Username, e.Organizador.FotoPerfil }
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
                    e.EsPatrocinado,
                    e.ImagenUrl,
                    Categorias = e.Categorias.Select(c => new { Categoria = new { c.Categoria.Id, c.Categoria.Nombre } }).ToList(),
                    Organizador = new { e.Organizador.Id, e.Organizador.NombreCompleto, e.Organizador.Username, e.Organizador.FotoPerfil },
                    Participantes = e.Participantes.Select(p => new
                    {
                        p.UsuarioId,
                        Usuario = new { p.Usuario.Id, p.Usuario.NombreCompleto, p.Usuario.Username, p.Usuario.FotoPerfil },
                        p.Asistio
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

            // Generate a random 3-character alphanumeric code (uppercase)
            var random = new Random();
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking chars like I, O, 0, 1
            var code = new string(Enumerable.Repeat(chars, 3).Select(s => s[random.Next(s.Length)]).ToArray());

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
                CodigoAsistencia = code,
                EsPatrocinado = dto.EsPatrocinado,
                ImagenUrl = dto.ImagenUrl
            };

            _context.Eventos.Add(evento);
            await _context.SaveChangesAsync(); // Get the generated ID

            // Automatically add organizer as participant (marked as attended by default)
            _context.ParticipantesEventos.Add(new ParticipanteEvento
            {
                EventoId = evento.Id,
                UsuarioId = firebaseUid,
                Asistio = true
            });

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

            // Check if user is penalized
            var usuario = await _context.Usuarios.FindAsync(firebaseUid);
            if (usuario == null) return BadRequest("Usuario no encontrado.");

            if (usuario.PenalizadoHasta.HasValue && usuario.PenalizadoHasta.Value > DateTime.UtcNow)
            {
                var remaining = usuario.PenalizadoHasta.Value - DateTime.UtcNow;
                var hours = Math.Ceiling(remaining.TotalHours);
                return BadRequest($"No puedes inscribirte a eventos. Tienes una penalización activa por inasistencia. Restan aprox. {hours} horas.");
            }

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

            var evento = await _context.Eventos.FindAsync(id);
            if (evento == null) return NotFound("Evento no encontrado.");
            if (evento.OrganizadorId == firebaseUid)
                return BadRequest("El organizador no puede abandonar su propio evento.");

            var participacion = await _context.ParticipantesEventos
                .FirstOrDefaultAsync(p => p.EventoId == id && p.UsuarioId == firebaseUid);

            if (participacion == null) return NotFound("No participas en este evento.");

            _context.ParticipantesEventos.Remove(participacion);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT /api/events/{id} - edit event details
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEvent(int id, [FromBody] CreateEventoDto dto)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

            var evento = await _context.Eventos
                .Include(e => e.Categorias)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (evento == null) return NotFound();

            if (evento.OrganizadorId != firebaseUid)
                return Forbid();

            // Update fields
            evento.Titulo = dto.Titulo;
            evento.FechaRealizacion = dto.FechaRealizacion;
            evento.Descripcion = dto.Descripcion;
            evento.RangoEdadMin = dto.RangoEdadMin;
            evento.RangoEdadMax = dto.RangoEdadMax;
            evento.Ubicacion = dto.Ubicacion;
            evento.NumMaxParticipantes = dto.NumMaxParticipantes;
            evento.EsPatrocinado = dto.EsPatrocinado;
            evento.ImagenUrl = dto.ImagenUrl;

            // Update categories
            _context.EventosCategorias.RemoveRange(evento.Categorias);
            foreach (var catId in dto.CategoriaIds)
            {
                _context.EventosCategorias.Add(new EventoCategoria { EventoId = id, CategoriaId = catId });
            }

            await _context.SaveChangesAsync();
            return await GetEvent(id);
        }

        // POST /api/events/{id}/validate-code
        [HttpPost("{id}/validate-code")]
        public async Task<IActionResult> ValidateCode(int id, [FromBody] ValidateCodeDto dto)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

            var evento = await _context.Eventos.FindAsync(id);
            if (evento == null) return NotFound("Evento no encontrado.");

            if (string.IsNullOrEmpty(evento.CodigoAsistencia))
                return BadRequest("Este evento no requiere código de asistencia.");

            if (!string.Equals(evento.CodigoAsistencia.Trim(), dto.Code?.Trim(), StringComparison.OrdinalIgnoreCase))
                return BadRequest("Código de asistencia incorrecto.");

            var participacion = await _context.ParticipantesEventos
                .FirstOrDefaultAsync(p => p.EventoId == id && p.UsuarioId == firebaseUid);

            if (participacion == null)
                return BadRequest("No estás inscrito en este evento.");

            participacion.Asistio = true;
            await _context.SaveChangesAsync();

            return Ok(new { Message = "¡Asistencia confirmada correctamente!" });
        }

        // GET /api/events/{id}/management - management data for organizer
        [HttpGet("{id}/management")]
        public async Task<IActionResult> GetEventManagement(int id)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

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
                    e.CodigoAsistencia,
                    e.EsPatrocinado,
                    e.ImagenUrl,
                    Categorias = e.Categorias.Select(c => c.CategoriaId).ToList(),
                    Participantes = e.Participantes.Select(p => new
                    {
                        p.UsuarioId,
                        NombreCompleto = p.Usuario.NombreCompleto,
                        Username = p.Usuario.Username,
                        FotoPerfil = p.Usuario.FotoPerfil,
                        Reputacion = p.Usuario.Reputacion,
                        Asistio = p.Asistio
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (evento == null) return NotFound();

            if (evento.OrganizadorId != firebaseUid)
                return Forbid();

            return Ok(evento);
        }

        // PUT /api/events/{id}/attendance - manually update participant attendance (mark present/absent)
        [HttpPut("{id}/attendance")]
        public async Task<IActionResult> UpdateAttendance(int id, [FromBody] UpdateAttendanceDto dto)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

            var evento = await _context.Eventos.FindAsync(id);
            if (evento == null) return NotFound("Evento no encontrado.");

            if (evento.OrganizadorId != firebaseUid)
                return Forbid();

            var participacion = await _context.ParticipantesEventos
                .FirstOrDefaultAsync(p => p.EventoId == id && p.UsuarioId == dto.UsuarioId);

            if (participacion == null)
                return NotFound("El usuario no participa en este evento.");

            var previousState = participacion.Asistio;
            participacion.Asistio = dto.Asistio;

            // Find participant to apply reputation penalty/recovery
            var participante = await _context.Usuarios.FindAsync(dto.UsuarioId);
            if (participante != null)
            {
                // If marked as absent (Asistio == false) and wasn't marked absent before
                if (dto.Asistio == false && previousState != false)
                {
                    participante.Reputacion = Math.Max(0, participante.Reputacion - 20);
                    participante.PenalizadoHasta = DateTime.UtcNow.AddDays(2); // 2 days penalty
                }
                // If marked as attended (Asistio == true) or pending (Asistio == null) and was previously marked absent
                else if (dto.Asistio != false && previousState == false)
                {
                    participante.Reputacion = Math.Min(100, participante.Reputacion + 20);
                    // Clear penalty if it's currently active (assuming it was set because of this absence)
                    if (participante.PenalizadoHasta.HasValue && participante.PenalizadoHasta.Value > DateTime.UtcNow)
                    {
                        participante.PenalizadoHasta = null;
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Asistencia actualizada." });
        }

        // POST /api/events/{id}/announcements - send announcement
        [HttpPost("{id}/announcements")]
        public async Task<IActionResult> PostAnnouncement(int id, [FromBody] CreateAnnouncementDto dto)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

            var evento = await _context.Eventos.FindAsync(id);
            if (evento == null) return NotFound("Evento no encontrado.");

            if (evento.OrganizadorId != firebaseUid)
                return Forbid();

            var aviso = new AvisoEvento
            {
                EventoId = id,
                Titulo = dto.Titulo,
                Contenido = dto.Contenido,
                FechaPublicacion = DateTime.UtcNow
            };

            _context.AvisosEventos.Add(aviso);
            await _context.SaveChangesAsync();

            return Ok(aviso);
        }

        // GET /api/events/{id}/announcements - get announcements of an event
        [HttpGet("{id}/announcements")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAnnouncements(int id)
        {
            var announcements = await _context.AvisosEventos
                .Where(a => a.EventoId == id)
                .OrderByDescending(a => a.FechaPublicacion)
                .Select(a => new
                {
                    a.Id,
                    a.Titulo,
                    a.Contenido,
                    a.FechaPublicacion
                })
                .ToListAsync();

            return Ok(announcements);
        }
    }

    public class ValidateCodeDto
    {
        public string Code { get; set; } = null!;
    }

    public class UpdateAttendanceDto
    {
        public string UsuarioId { get; set; } = null!;
        public bool? Asistio { get; set; }
    }

    public class CreateAnnouncementDto
    {
        public string Titulo { get; set; } = null!;
        public string Contenido { get; set; } = null!;
    }
}

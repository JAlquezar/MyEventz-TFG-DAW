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
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET /api/users — list all users
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetUsers()
        {
            var result = await _context.Usuarios
                .OrderBy(u => u.NombreCompleto)
                .Select(u => new
                {
                    u.Id,
                    u.NombreCompleto,
                    u.Username,
                    u.Email,
                    u.FotoPerfil,
                    Hobbies = u.Hobbies.Select(h => new { Categoria = new { h.Categoria.Id, h.Categoria.Nombre } }).ToList()
                })
                .ToListAsync();

            return Ok(result);
        }

        // GET /api/users/search?q=texto — search by name or username
        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchUsers([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return await GetUsers();

            var query = q.ToLower();
            var result = await _context.Usuarios
                .Where(u => u.NombreCompleto.ToLower().Contains(query) || u.Username.ToLower().Contains(query))
                .OrderBy(u => u.NombreCompleto)
                .Select(u => new
                {
                    u.Id,
                    u.NombreCompleto,
                    u.Username,
                    u.Email,
                    u.FotoPerfil,
                    Hobbies = u.Hobbies.Select(h => new { Categoria = new { h.Categoria.Id, h.Categoria.Nombre } }).ToList()
                })
                .ToListAsync();

            return Ok(result);
        }

        // GET /api/users/{id} — get user by Firebase UID with full includes
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUser(string id)
        {
            var user = await _context.Usuarios
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.NombreCompleto,
                    u.Username,
                    u.Email,
                    u.FechaNacimiento,
                    u.Biografia,
                    u.Instagram,
                    u.X,
                    u.YouTube,
                    u.TikTok,
                    u.FotoPerfil,
                    u.CreatedAt,
                    u.Reputacion,
                    u.PenalizadoHasta,
                    Hobbies = u.Hobbies.Select(h => new { Categoria = new { h.Categoria.Id, h.Categoria.Nombre } }).ToList(),
                    EventosOrganizados = u.EventosOrganizados.Select(e => new
                    {
                        e.Id, e.Titulo, e.FechaRealizacion, e.Ubicacion, e.ImagenUrl,
                        Categorias = e.Categorias.Select(c => new { Categoria = new { c.Categoria.Id, c.Categoria.Nombre } }).ToList(),
                        Participantes = e.Participantes.Select(p => new { p.UsuarioId }).ToList()
                    }).ToList(),
                    EventosParticipados = u.EventosParticipados.Select(p => new
                    {
                        Evento = new
                        {
                            p.Evento.Id, p.Evento.Titulo, p.Evento.FechaRealizacion, p.Evento.Ubicacion, p.Evento.ImagenUrl,
                            Categorias = p.Evento.Categorias.Select(c => new { Categoria = new { c.Categoria.Id, c.Categoria.Nombre } }).ToList(),
                            Participantes = p.Evento.Participantes.Select(ep => new { ep.UsuarioId }).ToList()
                        }
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (user == null) return NotFound();
            return Ok(user);
        }

        // GET /api/users/by-username/{username}
        [HttpGet("by-username/{username}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetUserByUsername(string username)
        {
            var user = await _context.Usuarios
                .Where(u => u.Username == username)
                .Select(u => new
                {
                    u.Id,
                    u.NombreCompleto,
                    u.Username,
                    u.Email,
                    u.FechaNacimiento,
                    u.Biografia,
                    u.Instagram,
                    u.X,
                    u.YouTube,
                    u.TikTok,
                    u.FotoPerfil,
                    u.CreatedAt,
                    u.Reputacion,
                    u.PenalizadoHasta,
                    Hobbies = u.Hobbies.Select(h => new { Categoria = new { h.Categoria.Id, h.Categoria.Nombre } }).ToList(),
                    EventosOrganizados = u.EventosOrganizados.Select(e => new
                    {
                        e.Id, e.Titulo, e.FechaRealizacion, e.Ubicacion, e.ImagenUrl,
                        Categorias = e.Categorias.Select(c => new { Categoria = new { c.Categoria.Id, c.Categoria.Nombre } }).ToList(),
                        Participantes = e.Participantes.Select(p => new { p.UsuarioId }).ToList()
                    }).ToList(),
                    EventosParticipados = u.EventosParticipados.Select(p => new
                    {
                        Evento = new
                        {
                            p.Evento.Id, p.Evento.Titulo, p.Evento.FechaRealizacion, p.Evento.Ubicacion, p.Evento.ImagenUrl,
                            Categorias = p.Evento.Categorias.Select(c => new { Categoria = new { c.Categoria.Id, c.Categoria.Nombre } }).ToList(),
                            Participantes = p.Evento.Participantes.Select(ep => new { ep.UsuarioId }).ToList()
                        }
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (user == null) return NotFound();
            return Ok(user);
        }

        // POST /api/users — create user (registration). Uses DTO to avoid model validation issues.
        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            // Idempotent: if user already exists by Firebase UID, return existing
            var existing = await _context.Usuarios.FindAsync(dto.Id);
            if (existing != null)
                return Ok(new { existing.Id, existing.NombreCompleto, existing.Username });

            // Check username uniqueness
            if (await _context.Usuarios.AnyAsync(u => u.Username == dto.Username))
                return BadRequest("Username ya existe.");

            var user = new Usuario
            {
                Id = dto.Id,
                NombreCompleto = dto.NombreCompleto,
                Username = dto.Username,
                Email = dto.Email,
                FechaNacimiento = dto.FechaNacimiento,
                Biografia = dto.Biografia,
            };

            _context.Usuarios.Add(user);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, new { user.Id, user.NombreCompleto, user.Username });
        }

        // PUT /api/users/{id} — update user profile. Uses DTO to avoid model validation issues.
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (firebaseUid != id)
                return Forbid();

            var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            // Update scalar fields (only if provided / not null)
            if (dto.NombreCompleto != null) user.NombreCompleto = dto.NombreCompleto;
            if (dto.Username != null) user.Username = dto.Username;
            user.Biografia = dto.Biografia;  // null is valid (clear bio)
            user.FechaNacimiento = dto.FechaNacimiento;
            user.Instagram = dto.Instagram;
            user.X = dto.X;
            user.YouTube = dto.YouTube;
            user.TikTok = dto.TikTok;
            if (dto.FotoPerfil != null) user.FotoPerfil = dto.FotoPerfil;

            // Update hobbies — delete old, insert new
            var oldHobbies = await _context.UsuariosHobbies
                .Where(h => h.UsuarioId == id)
                .ToListAsync();
            _context.UsuariosHobbies.RemoveRange(oldHobbies);

            foreach (var catId in dto.HobbyIds)
            {
                _context.UsuariosHobbies.Add(new UsuarioHobby
                {
                    UsuarioId = id,
                    CategoriaId = catId
                });
            }

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateException ex) { return BadRequest("Error al actualizar: " + ex.InnerException?.Message ?? ex.Message); }

            return NoContent();
        }

        // GET /api/users/my-announcements
        [HttpGet("my-announcements")]
        public async Task<IActionResult> GetMyAnnouncements()
        {
            var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(firebaseUid)) return Unauthorized();

            // Find all event ids the user participates in
            var eventIds = await _context.ParticipantesEventos
                .Where(p => p.UsuarioId == firebaseUid)
                .Select(p => p.EventoId)
                .ToListAsync();

            // Fetch all announcements for these events
            var announcements = await _context.AvisosEventos
                .Where(a => eventIds.Contains(a.EventoId))
                .OrderByDescending(a => a.FechaPublicacion)
                .Select(a => new
                {
                    a.Id,
                    a.Titulo,
                    a.Contenido,
                    a.FechaPublicacion,
                    Evento = new { a.Evento.Id, a.Evento.Titulo }
                })
                .ToListAsync();

            return Ok(announcements);
        }
    }
}

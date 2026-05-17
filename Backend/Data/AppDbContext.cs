using Microsoft.EntityFrameworkCore;
using MyEventz.API.Models;

namespace MyEventz.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Categoria> Categorias { get; set; }
        public DbSet<Evento> Eventos { get; set; }
        public DbSet<UsuarioHobby> UsuariosHobbies { get; set; }
        public DbSet<EventoCategoria> EventosCategorias { get; set; }
        public DbSet<ParticipanteEvento> ParticipantesEventos { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── Explicit table name mappings (match init.sql) ──────────────────
            modelBuilder.Entity<Usuario>().ToTable("Usuarios");
            modelBuilder.Entity<Categoria>().ToTable("Categorias");
            modelBuilder.Entity<Evento>().ToTable("Eventos");
            modelBuilder.Entity<UsuarioHobby>().ToTable("Usuarios_Hobbies");
            modelBuilder.Entity<EventoCategoria>().ToTable("Eventos_Categorias");
            modelBuilder.Entity<ParticipanteEvento>().ToTable("Participantes_Eventos");

            // ── N:M Usuario - Categoria (Hobbies) ─────────────────────────────
            modelBuilder.Entity<UsuarioHobby>()
                .HasKey(uh => new { uh.UsuarioId, uh.CategoriaId });

            modelBuilder.Entity<UsuarioHobby>()
                .HasOne(uh => uh.Usuario)
                .WithMany(u => u.Hobbies)
                .HasForeignKey(uh => uh.UsuarioId);

            modelBuilder.Entity<UsuarioHobby>()
                .HasOne(uh => uh.Categoria)
                .WithMany(c => c.Usuarios)
                .HasForeignKey(uh => uh.CategoriaId);

            // ── N:M Evento - Categoria ─────────────────────────────────────────
            modelBuilder.Entity<EventoCategoria>()
                .HasKey(ec => new { ec.EventoId, ec.CategoriaId });

            modelBuilder.Entity<EventoCategoria>()
                .HasOne(ec => ec.Evento)
                .WithMany(e => e.Categorias)
                .HasForeignKey(ec => ec.EventoId);

            modelBuilder.Entity<EventoCategoria>()
                .HasOne(ec => ec.Categoria)
                .WithMany(c => c.Eventos)
                .HasForeignKey(ec => ec.CategoriaId);

            // ── N:M Usuario - Evento (Participantes) ───────────────────────────
            modelBuilder.Entity<ParticipanteEvento>()
                .HasKey(pe => new { pe.UsuarioId, pe.EventoId });

            modelBuilder.Entity<ParticipanteEvento>()
                .HasOne(pe => pe.Usuario)
                .WithMany(u => u.EventosParticipados)
                .HasForeignKey(pe => pe.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ParticipanteEvento>()
                .HasOne(pe => pe.Evento)
                .WithMany(e => e.Participantes)
                .HasForeignKey(pe => pe.EventoId)
                .OnDelete(DeleteBehavior.Cascade);

            // ── 1:N Usuario - Evento (Organizador) ────────────────────────────
            modelBuilder.Entity<Evento>()
                .HasOne(e => e.Organizador)
                .WithMany(u => u.EventosOrganizados)
                .HasForeignKey(e => e.OrganizadorId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

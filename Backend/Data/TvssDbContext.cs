using Microsoft.EntityFrameworkCore;
using Tvss.AdminBackend.Models;

namespace Tvss.AdminBackend.Data
{
    public class TvssDbContext : DbContext
    {
        public TvssDbContext(DbContextOptions<TvssDbContext> options) : base(options)
        {
        }

        public DbSet<AdminUser> AdminUsers { get; set; } = null!;
        public DbSet<Media> Media { get; set; } = null!;
        public DbSet<CareerOpening> CareerOpenings { get; set; } = null!;
        public DbSet<Enquiry> Enquiries { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AdminUser>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
            });

            modelBuilder.Entity<Media>(entity =>
            {
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.PublishDate);
            });

            modelBuilder.Entity<CareerOpening>(entity =>
            {
                entity.HasIndex(e => e.Status);
            });

            modelBuilder.Entity<Enquiry>(entity =>
            {
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.SubmittedDate);
            });
        }
    }
}

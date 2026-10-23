using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tvss.AdminBackend.Models
{
    [Table("Media")]
    public class Media
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(250)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? ShortDescription { get; set; }

        [Required]
        [MaxLength(50)]
        public string MediaType { get; set; } = "Image"; // Image, Video, ExternalLink

        [MaxLength(500)]
        public string? FilePath { get; set; }

        [MaxLength(500)]
        public string? ThumbnailPath { get; set; }

        [MaxLength(500)]
        public string? ExternalLink { get; set; }

        public DateTime PublishDate { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Published"; // Published, Unpublished

        [NotMapped]
        public bool IsPublished
        {
            get => Status.Equals("Published", StringComparison.OrdinalIgnoreCase);
            set => Status = value ? "Published" : "Unpublished";
        }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? CreatedBy { get; set; }
    }
}

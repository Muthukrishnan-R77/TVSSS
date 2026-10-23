using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace Tvss.AdminBackend.DTOs
{
    public class CreateMediaDto
    {
        [Required]
        [MaxLength(250)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? ShortDescription { get; set; }

        [Required]
        public string MediaType { get; set; } = "Image"; // Image, Video, ExternalLink

        public string? ExternalLink { get; set; }

        public DateTime? PublishDate { get; set; }

        public string Status { get; set; } = "Published"; // Published, Unpublished

        public bool IsPublished { get; set; } = true;

        public IFormFile? MediaFile { get; set; }
    }

    public class UpdateMediaDto
    {
        [Required]
        [MaxLength(250)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? ShortDescription { get; set; }

        [Required]
        public string MediaType { get; set; } = "Image";

        public string? ExternalLink { get; set; }

        public DateTime? PublishDate { get; set; }

        public string Status { get; set; } = "Published";

        public bool IsPublished { get; set; } = true;

        public IFormFile? MediaFile { get; set; }
    }

    public class MediaStatusUpdateDto
    {
        public string? Status { get; set; } // Published, Unpublished
        public bool? IsPublished { get; set; }
    }

    public class MediaResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? ShortDescription { get; set; }
        public string MediaType { get; set; } = string.Empty;
        public string? FilePath { get; set; }
        public string? ThumbnailPath { get; set; }
        public string? ExternalLink { get; set; }
        public DateTime PublishDate { get; set; }
        public string Status { get; set; } = "Published";
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
    }
}

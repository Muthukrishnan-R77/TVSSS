using System;
using System.ComponentModel.DataAnnotations;

namespace Tvss.AdminBackend.DTOs
{
    public class CreateEnquiryDto
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(30)]
        public string? Phone { get; set; }

        [MaxLength(150)]
        public string? Company { get; set; }

        [Required]
        [MaxLength(250)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;
    }

    public class UpdateEnquiryDto
    {
        [Required]
        public string Status { get; set; } = "New"; // New, In Progress, Responded, Closed

        public string? AdminRemarks { get; set; }
    }

    public class EnquiryResponseDto
    {
        public int Id { get; set; }
        public string? EnquiryNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Company { get; set; }
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime SubmittedDate { get; set; }
        public DateTime SubmittedAt => SubmittedDate;
        public string Status { get; set; } = string.Empty;
        public string? AdminRemarks { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string? UpdatedBy { get; set; }
    }
}

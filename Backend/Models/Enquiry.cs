using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tvss.AdminBackend.Models
{
    [Table("Enquiries")]
    public class Enquiry
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(20)]
        public string? EnquiryNumber { get; set; }

        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        [EmailAddress]
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

        public DateTime SubmittedDate { get; set; } = DateTime.UtcNow;

        [NotMapped]
        public DateTime SubmittedAt
        {
            get => SubmittedDate;
            set => SubmittedDate = value;
        }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "New"; // New, In Progress, Responded, Closed

        public string? AdminRemarks { get; set; }

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }
    }
}

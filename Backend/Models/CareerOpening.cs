using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Tvss.AdminBackend.Models
{
    [Table("CareerOpenings")]
    public class CareerOpening
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string JobTitle { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Department { get; set; }

        [Required]
        [MaxLength(100)]
        public string Location { get; set; } = "Madurai, Tamil Nadu";

        [MaxLength(50)]
        public string EmploymentType { get; set; } = "Full Time";

        [Required]
        public string JobDescription { get; set; } = string.Empty;

        public string? Eligibility { get; set; }

        public string? RequiredSkills { get; set; }

        public string? Responsibilities { get; set; }

        public string? ExperienceRequired { get; set; }

        public int NumberOfVacancies { get; set; } = 1;

        [MaxLength(100)]
        public string? SalaryInformation { get; set; }

        public DateTime? ApplicationDeadline { get; set; }

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Active"; // Active, Inactive

        [NotMapped]
        public bool IsActive
        {
            get => Status.Equals("Active", StringComparison.OrdinalIgnoreCase);
            set => Status = value ? "Active" : "Inactive";
        }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? CreatedBy { get; set; }
    }
}

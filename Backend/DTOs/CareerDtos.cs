using System;
using System.ComponentModel.DataAnnotations;

namespace Tvss.AdminBackend.DTOs
{
    public class CreateCareerDto
    {
        [Required]
        [MaxLength(200)]
        public string JobTitle { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Department { get; set; }

        [Required]
        [MaxLength(100)]
        public string Location { get; set; } = "Madurai, Tamil Nadu";

        public string EmploymentType { get; set; } = "Full Time";

        [Required]
        public string JobDescription { get; set; } = string.Empty;

        public string? Eligibility { get; set; }

        public string? RequiredSkills { get; set; }

        public string? Responsibilities { get; set; }

        public string? ExperienceRequired { get; set; }

        [Range(1, 1000, ErrorMessage = "Number of vacancies must be greater than 0")]
        public int NumberOfVacancies { get; set; } = 1;

        public string? SalaryInformation { get; set; }

        public DateTime? ApplicationDeadline { get; set; }

        public string Status { get; set; } = "Active";

        public bool IsActive { get; set; } = true;
    }

    public class UpdateCareerDto : CreateCareerDto
    {
    }

    public class CareerStatusUpdateDto
    {
        public string? Status { get; set; } // Active, Inactive
        public bool? IsActive { get; set; }
    }

    public class CareerResponseDto
    {
        public int Id { get; set; }
        public string JobTitle { get; set; } = string.Empty;
        public string? Department { get; set; }
        public string Location { get; set; } = string.Empty;
        public string EmploymentType { get; set; } = string.Empty;
        public string JobDescription { get; set; } = string.Empty;
        public string? Eligibility { get; set; }
        public string? RequiredSkills { get; set; }
        public string? Responsibilities { get; set; }
        public string? ExperienceRequired { get; set; }
        public int NumberOfVacancies { get; set; }
        public string? SalaryInformation { get; set; }
        public DateTime? ApplicationDeadline { get; set; }
        public string Status { get; set; } = "Active";
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CreatedBy { get; set; }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Tvss.AdminBackend.Data;
using Tvss.AdminBackend.DTOs;
using Tvss.AdminBackend.Models;

namespace Tvss.AdminBackend.Services
{
    public interface ICareerService
    {
        Task<List<CareerResponseDto>> GetAllAsync(bool publicOnly = false, string? department = null, string? search = null);
        Task<CareerResponseDto?> GetByIdAsync(int id);
        Task<CareerResponseDto> CreateAsync(CreateCareerDto dto, string? createdBy = null);
        Task<CareerResponseDto?> UpdateAsync(int id, UpdateCareerDto dto);
        Task<bool> DeleteAsync(int id);
        Task<bool> SetActiveStatusAsync(int id, bool isActive);
        Task<bool> SetStatusAsync(int id, string status);
    }

    public class CareerService : ICareerService
    {
        private readonly TvssDbContext _db;

        private static readonly List<CareerOpening> _memoryCareers = new()
        {
            new CareerOpening
            {
                Id = 1,
                JobTitle = "Senior Automotive Sensor R&D Engineer",
                Department = "Research & Development",
                Location = "Madurai, Tamil Nadu",
                EmploymentType = "Full Time",
                JobDescription = "Design and development of next-generation hall effect and inductive position sensors for EV powertrains.",
                Eligibility = "B.E / B.Tech / M.Tech in Electrical / Electronics / Mechatronics",
                RequiredSkills = "SolidWorks, Altium, Embedded C, IATF 16949 Standards",
                Responsibilities = "Lead sensor product development from concept to mass production validation.",
                ExperienceRequired = "5 - 8 Years",
                NumberOfVacancies = 2,
                SalaryInformation = "Competitive industry standard",
                Status = "Active",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Admin"
            }
        };
        private static int _nextId = 2;

        public CareerService(TvssDbContext db)
        {
            _db = db;
        }

        public async Task<List<CareerResponseDto>> GetAllAsync(bool publicOnly = false, string? department = null, string? search = null)
        {
            try
            {
                var query = _db.CareerOpenings.AsQueryable();

                if (publicOnly)
                {
                    query = query.Where(c => (c.Status == "Active" || c.Status == "active") && (!c.ApplicationDeadline.HasValue || c.ApplicationDeadline >= DateTime.UtcNow.Date));
                }

                if (!string.IsNullOrWhiteSpace(department) && department != "all")
                {
                    query = query.Where(c => c.Department != null && c.Department.ToLower() == department.ToLower());
                }

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var s = search.ToLower();
                    query = query.Where(c => c.JobTitle.ToLower().Contains(s) || c.JobDescription.ToLower().Contains(s) || (c.RequiredSkills != null && c.RequiredSkills.ToLower().Contains(s)));
                }

                var items = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
                return items.Select(MapToDto).ToList();
            }
            catch
            {
                lock (_memoryCareers)
                {
                    var list = _memoryCareers.AsEnumerable();
                    if (publicOnly)
                    {
                        list = list.Where(c => c.IsActive && (!c.ApplicationDeadline.HasValue || c.ApplicationDeadline >= DateTime.UtcNow.Date));
                    }
                    if (!string.IsNullOrWhiteSpace(department) && department != "all")
                    {
                        list = list.Where(c => c.Department != null && c.Department.Equals(department, StringComparison.OrdinalIgnoreCase));
                    }
                    if (!string.IsNullOrWhiteSpace(search))
                    {
                        var s = search.ToLower();
                        list = list.Where(c => c.JobTitle.ToLower().Contains(s) || c.JobDescription.ToLower().Contains(s) || (c.RequiredSkills != null && c.RequiredSkills.ToLower().Contains(s)));
                    }
                    return list.OrderByDescending(c => c.CreatedAt).Select(MapToDto).ToList();
                }
            }
        }

        public async Task<CareerResponseDto?> GetByIdAsync(int id)
        {
            try
            {
                var item = await _db.CareerOpenings.FindAsync(id);
                if (item != null) return MapToDto(item);
            }
            catch { }

            lock (_memoryCareers)
            {
                var mem = _memoryCareers.FirstOrDefault(c => c.Id == id);
                return mem == null ? null : MapToDto(mem);
            }
        }

        public async Task<CareerResponseDto> CreateAsync(CreateCareerDto dto, string? createdBy = null)
        {
            var status = !string.IsNullOrWhiteSpace(dto.Status) ? dto.Status : (dto.IsActive ? "Active" : "Inactive");

            var career = new CareerOpening
            {
                JobTitle = dto.JobTitle,
                Department = dto.Department,
                Location = dto.Location,
                EmploymentType = dto.EmploymentType,
                JobDescription = dto.JobDescription,
                Eligibility = dto.Eligibility,
                RequiredSkills = dto.RequiredSkills,
                Responsibilities = dto.Responsibilities,
                ExperienceRequired = dto.ExperienceRequired,
                NumberOfVacancies = dto.NumberOfVacancies > 0 ? dto.NumberOfVacancies : 1,
                SalaryInformation = dto.SalaryInformation,
                ApplicationDeadline = dto.ApplicationDeadline,
                Status = status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = createdBy ?? "Admin"
            };

            try
            {
                _db.CareerOpenings.Add(career);
                await _db.SaveChangesAsync();
            }
            catch
            {
                lock (_memoryCareers)
                {
                    career.Id = _nextId++;
                    _memoryCareers.Add(career);
                }
            }

            return MapToDto(career);
        }

        public async Task<CareerResponseDto?> UpdateAsync(int id, UpdateCareerDto dto)
        {
            CareerOpening? career = null;
            try
            {
                career = await _db.CareerOpenings.FindAsync(id);
            }
            catch { }

            if (career != null)
            {
                career.JobTitle = dto.JobTitle;
                career.Department = dto.Department;
                career.Location = dto.Location;
                career.EmploymentType = dto.EmploymentType;
                career.JobDescription = dto.JobDescription;
                career.Eligibility = dto.Eligibility;
                career.RequiredSkills = dto.RequiredSkills;
                career.Responsibilities = dto.Responsibilities;
                career.ExperienceRequired = dto.ExperienceRequired;
                career.NumberOfVacancies = dto.NumberOfVacancies > 0 ? dto.NumberOfVacancies : 1;
                career.SalaryInformation = dto.SalaryInformation;
                career.ApplicationDeadline = dto.ApplicationDeadline;
                career.Status = !string.IsNullOrWhiteSpace(dto.Status) ? dto.Status : (dto.IsActive ? "Active" : "Inactive");
                career.UpdatedAt = DateTime.UtcNow;

                try
                {
                    await _db.SaveChangesAsync();
                }
                catch { }

                return MapToDto(career);
            }

            lock (_memoryCareers)
            {
                var mem = _memoryCareers.FirstOrDefault(c => c.Id == id);
                if (mem == null) return null;

                mem.JobTitle = dto.JobTitle;
                mem.Department = dto.Department;
                mem.Location = dto.Location;
                mem.EmploymentType = dto.EmploymentType;
                mem.JobDescription = dto.JobDescription;
                mem.Eligibility = dto.Eligibility;
                mem.RequiredSkills = dto.RequiredSkills;
                mem.Responsibilities = dto.Responsibilities;
                mem.ExperienceRequired = dto.ExperienceRequired;
                mem.NumberOfVacancies = dto.NumberOfVacancies > 0 ? dto.NumberOfVacancies : 1;
                mem.SalaryInformation = dto.SalaryInformation;
                mem.ApplicationDeadline = dto.ApplicationDeadline;
                mem.Status = !string.IsNullOrWhiteSpace(dto.Status) ? dto.Status : (dto.IsActive ? "Active" : "Inactive");
                mem.UpdatedAt = DateTime.UtcNow;

                return MapToDto(mem);
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var career = await _db.CareerOpenings.FindAsync(id);
                if (career != null)
                {
                    _db.CareerOpenings.Remove(career);
                    await _db.SaveChangesAsync();
                    return true;
                }
            }
            catch { }

            lock (_memoryCareers)
            {
                var mem = _memoryCareers.FirstOrDefault(c => c.Id == id);
                if (mem == null) return false;
                _memoryCareers.Remove(mem);
                return true;
            }
        }

        public async Task<bool> SetActiveStatusAsync(int id, bool isActive)
        {
            return await SetStatusAsync(id, isActive ? "Active" : "Inactive");
        }

        public async Task<bool> SetStatusAsync(int id, string status)
        {
            try
            {
                var career = await _db.CareerOpenings.FindAsync(id);
                if (career != null)
                {
                    career.Status = status;
                    career.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                    return true;
                }
            }
            catch { }

            lock (_memoryCareers)
            {
                var mem = _memoryCareers.FirstOrDefault(c => c.Id == id);
                if (mem == null) return false;
                mem.Status = status;
                mem.UpdatedAt = DateTime.UtcNow;
                return true;
            }
        }

        private static CareerResponseDto MapToDto(CareerOpening c) => new()
        {
            Id = c.Id,
            JobTitle = c.JobTitle,
            Department = c.Department,
            Location = c.Location,
            EmploymentType = c.EmploymentType,
            JobDescription = c.JobDescription,
            Eligibility = c.Eligibility,
            RequiredSkills = c.RequiredSkills,
            Responsibilities = c.Responsibilities,
            ExperienceRequired = c.ExperienceRequired,
            NumberOfVacancies = c.NumberOfVacancies,
            SalaryInformation = c.SalaryInformation,
            ApplicationDeadline = c.ApplicationDeadline,
            Status = c.Status,
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt,
            CreatedBy = c.CreatedBy
        };
    }
}

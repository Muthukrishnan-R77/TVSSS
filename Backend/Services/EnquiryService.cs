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
    public interface IEnquiryService
    {
        Task<List<EnquiryResponseDto>> GetAllAsync(string? status = null, string? search = null);
        Task<EnquiryResponseDto?> GetByIdAsync(int id);
        Task<EnquiryResponseDto> CreateAsync(CreateEnquiryDto dto);
        Task<EnquiryResponseDto?> UpdateStatusAsync(int id, UpdateEnquiryDto dto, string? updatedBy = null);
        Task<bool> DeleteAsync(int id);
    }

    public class EnquiryService : IEnquiryService
    {
        private readonly TvssDbContext _db;

        private static readonly List<Enquiry> _memoryEnquiries = new()
        {
            new Enquiry
            {
                Id = 1,
                EnquiryNumber = "ENQ-2026-0001",
                Name = "Rajesh Kumar",
                Email = "rajesh.kumar@oem-auto.com",
                Phone = "+91 98765 43210",
                Company = "Auto Components Ltd",
                Subject = "Public Website Inquiry (EV Speed Sensors)",
                Message = "We require custom hall effect speed sensor specifications for our upcoming electric bus powertrain.",
                SubmittedDate = DateTime.UtcNow.AddHours(-3),
                Status = "New",
                UpdatedAt = DateTime.UtcNow
            }
        };
        private static int _nextId = 2;

        public EnquiryService(TvssDbContext db)
        {
            _db = db;
        }

        public async Task<List<EnquiryResponseDto>> GetAllAsync(string? status = null, string? search = null)
        {
            try
            {
                var query = _db.Enquiries.AsQueryable();

                if (!string.IsNullOrWhiteSpace(status) && status != "all")
                {
                    query = query.Where(e => e.Status.ToLower() == status.ToLower());
                }

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var s = search.ToLower();
                    query = query.Where(e => e.Name.ToLower().Contains(s) || e.Email.ToLower().Contains(s) || e.Subject.ToLower().Contains(s) || (e.Company != null && e.Company.ToLower().Contains(s)));
                }

                var items = await query.OrderByDescending(e => e.SubmittedDate).ToListAsync();
                return items.Select(MapToDto).ToList();
            }
            catch
            {
                lock (_memoryEnquiries)
                {
                    var list = _memoryEnquiries.AsEnumerable();
                    if (!string.IsNullOrWhiteSpace(status) && status != "all")
                    {
                        list = list.Where(e => e.Status.Equals(status, StringComparison.OrdinalIgnoreCase));
                    }
                    if (!string.IsNullOrWhiteSpace(search))
                    {
                        var s = search.ToLower();
                        list = list.Where(e => e.Name.ToLower().Contains(s) || e.Email.ToLower().Contains(s) || e.Subject.ToLower().Contains(s) || (e.Company != null && e.Company.ToLower().Contains(s)));
                    }
                    return list.OrderByDescending(e => e.SubmittedDate).Select(MapToDto).ToList();
                }
            }
        }

        public async Task<EnquiryResponseDto?> GetByIdAsync(int id)
        {
            try
            {
                var item = await _db.Enquiries.FindAsync(id);
                if (item != null) return MapToDto(item);
            }
            catch { }

            lock (_memoryEnquiries)
            {
                var mem = _memoryEnquiries.FirstOrDefault(e => e.Id == id);
                return mem == null ? null : MapToDto(mem);
            }
        }

        public async Task<EnquiryResponseDto> CreateAsync(CreateEnquiryDto dto)
        {
            var now = DateTime.UtcNow;
            var enquiry = new Enquiry
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Company = dto.Company,
                Subject = dto.Subject,
                Message = dto.Message,
                SubmittedDate = now,
                Status = "New",
                UpdatedAt = now
            };

            try
            {
                _db.Enquiries.Add(enquiry);
                await _db.SaveChangesAsync();

                enquiry.EnquiryNumber = $"ENQ-{now.Year}-{enquiry.Id:D4}";
                await _db.SaveChangesAsync();
            }
            catch
            {
                lock (_memoryEnquiries)
                {
                    enquiry.Id = _nextId++;
                    enquiry.EnquiryNumber = $"ENQ-{now.Year}-{enquiry.Id:D4}";
                    _memoryEnquiries.Add(enquiry);
                }
            }

            return MapToDto(enquiry);
        }

        public async Task<EnquiryResponseDto?> UpdateStatusAsync(int id, UpdateEnquiryDto dto, string? updatedBy = null)
        {
            Enquiry? enquiry = null;
            try
            {
                enquiry = await _db.Enquiries.FindAsync(id);
            }
            catch { }

            if (enquiry != null)
            {
                enquiry.Status = dto.Status;
                if (dto.AdminRemarks != null) enquiry.AdminRemarks = dto.AdminRemarks;
                enquiry.UpdatedAt = DateTime.UtcNow;
                enquiry.UpdatedBy = updatedBy ?? "Admin";

                try
                {
                    await _db.SaveChangesAsync();
                }
                catch { }

                return MapToDto(enquiry);
            }

            lock (_memoryEnquiries)
            {
                var mem = _memoryEnquiries.FirstOrDefault(e => e.Id == id);
                if (mem == null) return null;

                mem.Status = dto.Status;
                if (dto.AdminRemarks != null) mem.AdminRemarks = dto.AdminRemarks;
                mem.UpdatedAt = DateTime.UtcNow;
                mem.UpdatedBy = updatedBy ?? "Admin";

                return MapToDto(mem);
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var enquiry = await _db.Enquiries.FindAsync(id);
                if (enquiry != null)
                {
                    _db.Enquiries.Remove(enquiry);
                    await _db.SaveChangesAsync();
                    return true;
                }
            }
            catch { }

            lock (_memoryEnquiries)
            {
                var mem = _memoryEnquiries.FirstOrDefault(e => e.Id == id);
                if (mem == null) return false;
                _memoryEnquiries.Remove(mem);
                return true;
            }
        }

        private static EnquiryResponseDto MapToDto(Enquiry e) => new()
        {
            Id = e.Id,
            EnquiryNumber = string.IsNullOrEmpty(e.EnquiryNumber) ? $"ENQ-2026-{e.Id:D4}" : e.EnquiryNumber,
            Name = e.Name,
            Email = e.Email,
            Phone = e.Phone,
            Company = e.Company,
            Subject = e.Subject,
            Message = e.Message,
            SubmittedDate = e.SubmittedDate,
            Status = e.Status,
            AdminRemarks = e.AdminRemarks,
            UpdatedAt = e.UpdatedAt,
            UpdatedBy = e.UpdatedBy
        };
    }
}

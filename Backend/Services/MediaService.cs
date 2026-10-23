using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Tvss.AdminBackend.Data;
using Tvss.AdminBackend.DTOs;
using Tvss.AdminBackend.Models;

namespace Tvss.AdminBackend.Services
{
    public interface IMediaService
    {
        Task<List<MediaResponseDto>> GetAllAsync(bool publicOnly = false, string? mediaType = null, string? search = null);
        Task<MediaResponseDto?> GetByIdAsync(int id);
        Task<MediaResponseDto> CreateAsync(CreateMediaDto dto, string? createdBy = null);
        Task<MediaResponseDto?> UpdateAsync(int id, UpdateMediaDto dto);
        Task<bool> DeleteAsync(int id);
        Task<bool> SetPublishStatusAsync(int id, bool isPublished);
        Task<bool> SetStatusAsync(int id, string status);
    }

    public class MediaService : IMediaService
    {
        private readonly TvssDbContext _db;
        private readonly IConfiguration _config;
        private readonly string _uploadPath;

        private static readonly List<Media> _memoryMedia = new()
        {
            new Media
            {
                Id = 1,
                Title = "TVS Sensing Solutions at EV India Expo 2021",
                ShortDescription = "TVS Sensing Solutions participated in EV India Expo – 2021 in India Expo Mart, Greater Noida.",
                MediaType = "Image",
                FilePath = "/1.png",
                ThumbnailPath = "/1.png",
                PublishDate = new DateTime(2021, 12, 25),
                Status = "Published",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Admin"
            },
            new Media
            {
                Id = 2,
                Title = "TVS Sensing Solutions at Green Vehicle Expo 2021",
                ShortDescription = "TVS Sensing Solutions participated in Green Vehicle Expo – 2021 in Bangalore International Exhibition Centre.",
                MediaType = "Image",
                FilePath = "/2.png",
                ThumbnailPath = "/2.png",
                PublishDate = new DateTime(2021, 11, 27),
                Status = "Published",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Admin"
            }
        };
        private static int _nextId = 3;

        public MediaService(TvssDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), _config["UploadSettings:UploadPath"] ?? "Uploads");
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        public async Task<List<MediaResponseDto>> GetAllAsync(bool publicOnly = false, string? mediaType = null, string? search = null)
        {
            try
            {
                var query = _db.Media.AsQueryable();

                if (publicOnly)
                {
                    query = query.Where(m => (m.Status == "Published" || m.Status == "published") && m.PublishDate <= DateTime.UtcNow);
                }

                if (!string.IsNullOrWhiteSpace(mediaType) && mediaType != "all")
                {
                    query = query.Where(m => m.MediaType.ToLower() == mediaType.ToLower());
                }

                if (!string.IsNullOrWhiteSpace(search))
                {
                    var s = search.ToLower();
                    query = query.Where(m => m.Title.ToLower().Contains(s) || (m.ShortDescription != null && m.ShortDescription.ToLower().Contains(s)));
                }

                var items = await query.OrderByDescending(m => m.PublishDate).ToListAsync();
                return items.Select(MapToDto).ToList();
            }
            catch
            {
                lock (_memoryMedia)
                {
                    var list = _memoryMedia.AsEnumerable();
                    if (publicOnly)
                    {
                        list = list.Where(m => m.IsPublished && m.PublishDate <= DateTime.UtcNow);
                    }
                    if (!string.IsNullOrWhiteSpace(mediaType) && mediaType != "all")
                    {
                        list = list.Where(m => m.MediaType.Equals(mediaType, StringComparison.OrdinalIgnoreCase));
                    }
                    if (!string.IsNullOrWhiteSpace(search))
                    {
                        var s = search.ToLower();
                        list = list.Where(m => m.Title.ToLower().Contains(s) || (m.ShortDescription != null && m.ShortDescription.ToLower().Contains(s)));
                    }
                    return list.OrderByDescending(m => m.PublishDate).Select(MapToDto).ToList();
                }
            }
        }

        public async Task<MediaResponseDto?> GetByIdAsync(int id)
        {
            try
            {
                var item = await _db.Media.FindAsync(id);
                if (item != null) return MapToDto(item);
            }
            catch { }

            lock (_memoryMedia)
            {
                var mem = _memoryMedia.FirstOrDefault(m => m.Id == id);
                return mem == null ? null : MapToDto(mem);
            }
        }

        public async Task<MediaResponseDto> CreateAsync(CreateMediaDto dto, string? createdBy = null)
        {
            string? filePath = null;
            if (dto.MediaFile != null && dto.MediaFile.Length > 0)
            {
                filePath = await SaveUploadedFileAsync(dto.MediaFile);
            }

            var status = !string.IsNullOrWhiteSpace(dto.Status) ? dto.Status : (dto.IsPublished ? "Published" : "Unpublished");

            var media = new Media
            {
                Title = dto.Title,
                ShortDescription = dto.ShortDescription,
                MediaType = dto.MediaType,
                FilePath = filePath,
                ThumbnailPath = dto.MediaType == "Image" ? filePath : null,
                ExternalLink = dto.ExternalLink,
                PublishDate = dto.PublishDate ?? DateTime.UtcNow,
                Status = status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                CreatedBy = createdBy ?? "Admin"
            };

            try
            {
                _db.Media.Add(media);
                await _db.SaveChangesAsync();
            }
            catch
            {
                lock (_memoryMedia)
                {
                    media.Id = _nextId++;
                    _memoryMedia.Add(media);
                }
            }

            return MapToDto(media);
        }

        public async Task<MediaResponseDto?> UpdateAsync(int id, UpdateMediaDto dto)
        {
            Media? media = null;
            try
            {
                media = await _db.Media.FindAsync(id);
            }
            catch { }

            if (media != null)
            {
                if (dto.MediaFile != null && dto.MediaFile.Length > 0)
                {
                    media.FilePath = await SaveUploadedFileAsync(dto.MediaFile);
                    if (dto.MediaType == "Image") media.ThumbnailPath = media.FilePath;
                }

                media.Title = dto.Title;
                media.ShortDescription = dto.ShortDescription;
                media.MediaType = dto.MediaType;
                media.ExternalLink = dto.ExternalLink;
                if (dto.PublishDate.HasValue) media.PublishDate = dto.PublishDate.Value;
                media.Status = !string.IsNullOrWhiteSpace(dto.Status) ? dto.Status : (dto.IsPublished ? "Published" : "Unpublished");
                media.UpdatedAt = DateTime.UtcNow;

                try
                {
                    await _db.SaveChangesAsync();
                }
                catch { }

                return MapToDto(media);
            }

            lock (_memoryMedia)
            {
                var mem = _memoryMedia.FirstOrDefault(m => m.Id == id);
                if (mem == null) return null;

                mem.Title = dto.Title;
                mem.ShortDescription = dto.ShortDescription;
                mem.MediaType = dto.MediaType;
                mem.ExternalLink = dto.ExternalLink;
                if (dto.PublishDate.HasValue) mem.PublishDate = dto.PublishDate.Value;
                mem.Status = !string.IsNullOrWhiteSpace(dto.Status) ? dto.Status : (dto.IsPublished ? "Published" : "Unpublished");
                mem.UpdatedAt = DateTime.UtcNow;

                return MapToDto(mem);
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            try
            {
                var media = await _db.Media.FindAsync(id);
                if (media != null)
                {
                    _db.Media.Remove(media);
                    await _db.SaveChangesAsync();
                    return true;
                }
            }
            catch { }

            lock (_memoryMedia)
            {
                var mem = _memoryMedia.FirstOrDefault(m => m.Id == id);
                if (mem == null) return false;
                _memoryMedia.Remove(mem);
                return true;
            }
        }

        public async Task<bool> SetPublishStatusAsync(int id, bool isPublished)
        {
            return await SetStatusAsync(id, isPublished ? "Published" : "Unpublished");
        }

        public async Task<bool> SetStatusAsync(int id, string status)
        {
            try
            {
                var media = await _db.Media.FindAsync(id);
                if (media != null)
                {
                    media.Status = status;
                    media.UpdatedAt = DateTime.UtcNow;
                    await _db.SaveChangesAsync();
                    return true;
                }
            }
            catch { }

            lock (_memoryMedia)
            {
                var mem = _memoryMedia.FirstOrDefault(m => m.Id == id);
                if (mem == null) return false;
                mem.Status = status;
                mem.UpdatedAt = DateTime.UtcNow;
                return true;
            }
        }

        private async Task<string> SaveUploadedFileAsync(Microsoft.AspNetCore.Http.IFormFile file)
        {
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            var uniqueName = $"{Guid.NewGuid()}{ext}";
            var fullPath = Path.Combine(_uploadPath, uniqueName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return $"/Uploads/{uniqueName}";
        }

        private static MediaResponseDto MapToDto(Media m) => new()
        {
            Id = m.Id,
            Title = m.Title,
            ShortDescription = m.ShortDescription,
            MediaType = m.MediaType,
            FilePath = m.FilePath,
            ThumbnailPath = m.ThumbnailPath,
            ExternalLink = m.ExternalLink,
            PublishDate = m.PublishDate,
            Status = m.Status,
            IsPublished = m.IsPublished,
            CreatedAt = m.CreatedAt,
            CreatedBy = m.CreatedBy
        };
    }
}

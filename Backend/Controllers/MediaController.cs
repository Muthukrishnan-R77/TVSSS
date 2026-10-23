using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tvss.AdminBackend.DTOs;
using Tvss.AdminBackend.Services;

namespace Tvss.AdminBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly IMediaService _mediaService;

        public MediaController(IMediaService mediaService)
        {
            _mediaService = mediaService;
        }

        // Public endpoint to get published media for website
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool publicOnly = false, [FromQuery] string? type = null, [FromQuery] string? search = null)
        {
            // If request is unauthenticated, force publicOnly = true
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                publicOnly = true;
            }

            var items = await _mediaService.GetAllAsync(publicOnly, type, search);
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _mediaService.GetByIdAsync(id);
            if (item == null) return NotFound(new { message = "Media item not found" });

            if (!item.IsPublished && (!User.Identity?.IsAuthenticated ?? true))
            {
                return Unauthorized(new { message = "Access denied" });
            }

            return Ok(item);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateMediaDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var createdBy = User.Identity?.Name ?? "Admin";
            var result = await _mediaService.CreateAsync(dto, createdBy);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateMediaDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _mediaService.UpdateAsync(id, dto);
            if (result == null) return NotFound(new { message = "Media item not found" });

            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _mediaService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Media item not found" });

            return Ok(new { success = true, message = "Media deleted successfully" });
        }

        [Authorize]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] MediaStatusUpdateDto? dto, [FromQuery] string? status)
        {
            var targetStatus = dto?.Status ?? status ?? (dto?.IsPublished == true ? "Published" : "Unpublished");
            var success = await _mediaService.SetStatusAsync(id, targetStatus);
            if (!success) return NotFound(new { message = "Media item not found" });

            return Ok(new { success = true, message = $"Media status updated to {targetStatus}" });
        }

        [Authorize]
        [HttpPatch("{id}/publish")]
        public async Task<IActionResult> Publish(int id)
        {
            var success = await _mediaService.SetPublishStatusAsync(id, true);
            if (!success) return NotFound(new { message = "Media item not found" });

            return Ok(new { success = true, message = "Media published successfully" });
        }

        [Authorize]
        [HttpPatch("{id}/unpublish")]
        public async Task<IActionResult> Unpublish(int id)
        {
            var success = await _mediaService.SetPublishStatusAsync(id, false);
            if (!success) return NotFound(new { message = "Media item not found" });

            return Ok(new { success = true, message = "Media unpublished successfully" });
        }
    }
}

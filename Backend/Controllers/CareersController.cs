using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tvss.AdminBackend.DTOs;
using Tvss.AdminBackend.Services;

namespace Tvss.AdminBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CareersController : ControllerBase
    {
        private readonly ICareerService _careerService;

        public CareersController(ICareerService careerService)
        {
            _careerService = careerService;
        }

        // Public endpoint to get active job openings
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] bool publicOnly = false, [FromQuery] string? department = null, [FromQuery] string? search = null)
        {
            if (!User.Identity?.IsAuthenticated ?? true)
            {
                publicOnly = true;
            }

            var items = await _careerService.GetAllAsync(publicOnly, department, search);
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _careerService.GetByIdAsync(id);
            if (item == null) return NotFound(new { message = "Job opening not found" });

            if (!item.IsActive && (!User.Identity?.IsAuthenticated ?? true))
            {
                return Unauthorized(new { message = "Access denied" });
            }

            return Ok(item);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCareerDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var createdBy = User.Identity?.Name ?? "Admin";
            var result = await _careerService.CreateAsync(dto, createdBy);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCareerDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _careerService.UpdateAsync(id, dto);
            if (result == null) return NotFound(new { message = "Job opening not found" });

            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _careerService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Job opening not found" });

            return Ok(new { success = true, message = "Job opening deleted successfully" });
        }

        [Authorize]
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] CareerStatusUpdateDto? dto, [FromQuery] string? status)
        {
            var targetStatus = dto?.Status ?? status ?? (dto?.IsActive == true ? "Active" : "Inactive");
            var success = await _careerService.SetStatusAsync(id, targetStatus);
            if (!success) return NotFound(new { message = "Job opening not found" });

            return Ok(new { success = true, message = $"Job opening status updated to {targetStatus}" });
        }

        [Authorize]
        [HttpPatch("{id}/activate")]
        public async Task<IActionResult> Activate(int id)
        {
            var success = await _careerService.SetActiveStatusAsync(id, true);
            if (!success) return NotFound(new { message = "Job opening not found" });

            return Ok(new { success = true, message = "Job opening activated successfully" });
        }

        [Authorize]
        [HttpPatch("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(int id)
        {
            var success = await _careerService.SetActiveStatusAsync(id, false);
            if (!success) return NotFound(new { message = "Job opening not found" });

            return Ok(new { success = true, message = "Job opening deactivated successfully" });
        }
    }
}

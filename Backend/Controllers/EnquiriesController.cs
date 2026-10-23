using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tvss.AdminBackend.DTOs;
using Tvss.AdminBackend.Services;

namespace Tvss.AdminBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EnquiriesController : ControllerBase
    {
        private readonly IEnquiryService _enquiryService;

        public EnquiriesController(IEnquiryService enquiryService)
        {
            _enquiryService = enquiryService;
        }

        // Public endpoint to submit enquiry from Reach Us page
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEnquiryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var result = await _enquiryService.CreateAsync(dto);
            return Ok(new { success = true, message = "Thank you! Your enquiry has been received successfully.", id = result.Id });
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? status = null, [FromQuery] string? search = null)
        {
            var items = await _enquiryService.GetAllAsync(status, search);
            return Ok(items);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _enquiryService.GetByIdAsync(id);
            if (item == null) return NotFound(new { message = "Enquiry not found" });

            return Ok(item);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateEnquiryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var updatedBy = User.Identity?.Name ?? "Admin";
            var result = await _enquiryService.UpdateStatusAsync(id, dto, updatedBy);
            if (result == null) return NotFound(new { message = "Enquiry not found" });

            return Ok(result);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _enquiryService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Enquiry not found" });

            return Ok(new { success = true, message = "Enquiry deleted successfully" });
        }
    }
}

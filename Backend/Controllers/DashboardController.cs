using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tvss.AdminBackend.DTOs;
using Tvss.AdminBackend.Services;

namespace Tvss.AdminBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IMediaService _mediaService;
        private readonly ICareerService _careerService;
        private readonly IEnquiryService _enquiryService;

        public DashboardController(IMediaService mediaService, ICareerService careerService, IEnquiryService enquiryService)
        {
            _mediaService = mediaService;
            _careerService = careerService;
            _enquiryService = enquiryService;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var media = await _mediaService.GetAllAsync(publicOnly: false);
            var careers = await _careerService.GetAllAsync(publicOnly: false);
            var enquiries = await _enquiryService.GetAllAsync();

            var summary = new DashboardSummaryDto
            {
                TotalMedia = media.Count,
                PublishedMedia = media.Count(m => m.IsPublished),
                DraftMedia = media.Count(m => !m.IsPublished),

                TotalCareers = careers.Count,
                ActiveCareers = careers.Count(c => c.IsActive),

                TotalEnquiries = enquiries.Count,
                NewEnquiries = enquiries.Count(e => e.Status == "New"),
                InProgressEnquiries = enquiries.Count(e => e.Status == "In Progress"),
                RespondedEnquiries = enquiries.Count(e => e.Status == "Responded"),
                ClosedEnquiries = enquiries.Count(e => e.Status == "Closed"),

                RecentMedia = media.Take(5).ToList(),
                RecentCareers = careers.Take(5).ToList(),
                RecentEnquiries = enquiries.Take(5).ToList()
            };

            return Ok(summary);
        }
    }
}

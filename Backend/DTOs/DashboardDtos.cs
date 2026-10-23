using System.Collections.Generic;

namespace Tvss.AdminBackend.DTOs
{
    public class DashboardSummaryDto
    {
        public int TotalMedia { get; set; }
        public int PublishedMedia { get; set; }
        public int DraftMedia { get; set; }

        public int TotalCareers { get; set; }
        public int ActiveCareers { get; set; }

        public int TotalEnquiries { get; set; }
        public int NewEnquiries { get; set; }
        public int InProgressEnquiries { get; set; }
        public int RespondedEnquiries { get; set; }
        public int ClosedEnquiries { get; set; }

        public List<MediaResponseDto> RecentMedia { get; set; } = new();
        public List<CareerResponseDto> RecentCareers { get; set; } = new();
        public List<EnquiryResponseDto> RecentEnquiries { get; set; } = new();
    }
}

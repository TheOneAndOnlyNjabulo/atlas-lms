using System.ComponentModel.DataAnnotations;

namespace LMS.Core.DTOs.Announcements;

public class CreateAnnouncementDto
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Content { get; set; } = string.Empty;
}

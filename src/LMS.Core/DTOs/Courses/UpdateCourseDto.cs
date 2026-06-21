using System.ComponentModel.DataAnnotations;

namespace LMS.Core.DTOs.Courses;

public class UpdateCourseDto
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    [Range(1, 30)] public int Credits { get; set; }
    public bool IsActive { get; set; }
}

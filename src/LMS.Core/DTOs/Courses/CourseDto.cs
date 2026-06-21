namespace LMS.Core.DTOs.Courses;

public class CourseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int Credits { get; set; }
    public bool IsActive { get; set; }
    public string LecturerName { get; set; } = string.Empty;
    public string LecturerId { get; set; } = string.Empty;
    public int EnrollmentCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

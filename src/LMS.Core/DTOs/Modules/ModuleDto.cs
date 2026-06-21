namespace LMS.Core.DTOs.Modules;

public class ModuleDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Order { get; set; }
    public Guid CourseId { get; set; }
    public int AssignmentCount { get; set; }
    public DateTime CreatedAt { get; set; }
}

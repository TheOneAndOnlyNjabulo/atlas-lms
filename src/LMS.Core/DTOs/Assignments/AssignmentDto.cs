namespace LMS.Core.DTOs.Assignments;

public class AssignmentDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public decimal MaxGrade { get; set; }
    public Guid ModuleId { get; set; }
    public bool IsOverdue => DateTime.UtcNow > DueDate;
    public DateTime CreatedAt { get; set; }
}

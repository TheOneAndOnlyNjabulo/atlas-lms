namespace LMS.Core.Entities;

public class Assignment
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public decimal MaxGrade { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid ModuleId { get; set; }
    public Module Module { get; set; } = null!;

    public ICollection<Submission> Submissions { get; set; } = [];
}

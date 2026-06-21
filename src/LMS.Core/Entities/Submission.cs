using LMS.Core.Enums;

namespace LMS.Core.Entities;

public class Submission
{
    public Guid Id { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
    public SubmissionStatus Status { get; set; } = SubmissionStatus.Submitted;

    public Guid AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;

    public string StudentId { get; set; } = string.Empty;
    public ApplicationUser Student { get; set; } = null!;

    public Grade? Grade { get; set; }
}

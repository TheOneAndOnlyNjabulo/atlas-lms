using LMS.Core.Enums;

namespace LMS.Core.DTOs.Submissions;

public class SubmissionDto
{
    public Guid Id { get; set; }
    public string StudentName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public SubmissionStatus Status { get; set; }
    public DateTime SubmittedAt { get; set; }
    public decimal? Score { get; set; }
    public string? Feedback { get; set; }
}

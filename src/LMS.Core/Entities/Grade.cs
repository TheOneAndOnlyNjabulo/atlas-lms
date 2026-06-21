namespace LMS.Core.Entities;

public class Grade
{
    public Guid Id { get; set; }
    public decimal Score { get; set; }
    public string Feedback { get; set; } = string.Empty;
    public DateTime GradedAt { get; set; } = DateTime.UtcNow;

    public Guid SubmissionId { get; set; }
    public Submission Submission { get; set; } = null!;

    public string GradedById { get; set; } = string.Empty;
    public ApplicationUser GradedBy { get; set; } = null!;
}

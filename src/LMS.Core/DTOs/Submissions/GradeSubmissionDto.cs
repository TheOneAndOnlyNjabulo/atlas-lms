using System.ComponentModel.DataAnnotations;

namespace LMS.Core.DTOs.Submissions;

public class GradeSubmissionDto
{
    [Required, Range(0, 100)] public decimal Score { get; set; }
    [Required] public string Feedback { get; set; } = string.Empty;
}

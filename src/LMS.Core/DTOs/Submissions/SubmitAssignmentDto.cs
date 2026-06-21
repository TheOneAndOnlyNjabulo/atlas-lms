using System.ComponentModel.DataAnnotations;

namespace LMS.Core.DTOs.Submissions;

public class SubmitAssignmentDto
{
    [Required] public string FilePath { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

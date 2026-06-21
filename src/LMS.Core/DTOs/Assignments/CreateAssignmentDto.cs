using System.ComponentModel.DataAnnotations;

namespace LMS.Core.DTOs.Assignments;

public class CreateAssignmentDto
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    [Required] public DateTime DueDate { get; set; }
    [Range(1, 100)] public decimal MaxGrade { get; set; }
}

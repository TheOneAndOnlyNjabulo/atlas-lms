using System.ComponentModel.DataAnnotations;

namespace LMS.Core.DTOs.Modules;

public class CreateModuleDto
{
    [Required] public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Order { get; set; }
}

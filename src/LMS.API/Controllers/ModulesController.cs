using System.Security.Claims;
using LMS.Core.DTOs.Modules;
using LMS.Core.Entities;
using LMS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LMS.Infrastructure.Data;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/courses/{courseId:guid}/modules")]
[Authorize]
public class ModulesController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly ApplicationDbContext _context;

    public ModulesController(IUnitOfWork uow, ApplicationDbContext context)
    {
        _uow = uow;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ModuleDto>>> GetAll(Guid courseId)
    {
        var modules = await _context.Modules
            .Include(m => m.Assignments)
            .Where(m => m.CourseId == courseId)
            .OrderBy(m => m.Order)
            .ToListAsync();

        return Ok(modules.Select(ToDto));
    }

    [HttpPost]
    [Authorize(Roles = "Lecturer,Admin")]
    public async Task<ActionResult<ModuleDto>> Create(Guid courseId, CreateModuleDto dto)
    {
        var course = await _uow.Courses.GetByIdAsync(courseId);
        if (course == null) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var role = User.FindFirstValue(ClaimTypes.Role)!;

        if (role != "Admin" && course.LecturerId != userId)
            return Forbid();

        var module = new Module
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Content = dto.Content,
            Order = dto.Order,
            CourseId = courseId
        };

        _context.Modules.Add(module);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { courseId }, ToDto(module));
    }

    [HttpDelete("{moduleId:guid}")]
    [Authorize(Roles = "Lecturer,Admin")]
    public async Task<IActionResult> Delete(Guid courseId, Guid moduleId)
    {
        var module = await _context.Modules.FindAsync(moduleId);
        if (module == null || module.CourseId != courseId) return NotFound();

        _context.Modules.Remove(module);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static ModuleDto ToDto(Module m) => new()
    {
        Id = m.Id,
        Title = m.Title,
        Description = m.Description,
        Content = m.Content,
        Order = m.Order,
        CourseId = m.CourseId,
        AssignmentCount = m.Assignments?.Count ?? 0,
        CreatedAt = m.CreatedAt
    };
}

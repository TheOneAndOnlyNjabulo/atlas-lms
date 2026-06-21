using System.Security.Claims;
using LMS.Core.DTOs.Assignments;
using LMS.Core.Entities;
using LMS.Core.Interfaces;
using LMS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/modules/{moduleId:guid}/assignments")]
[Authorize]
public class AssignmentsController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly ApplicationDbContext _context;

    public AssignmentsController(IUnitOfWork uow, ApplicationDbContext context)
    {
        _uow = uow;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AssignmentDto>>> GetAll(Guid moduleId)
    {
        var assignments = await _context.Assignments
            .Where(a => a.ModuleId == moduleId)
            .ToListAsync();

        return Ok(assignments.Select(ToDto));
    }

    [HttpPost]
    [Authorize(Roles = "Lecturer,Admin")]
    public async Task<ActionResult<AssignmentDto>> Create(Guid moduleId, CreateAssignmentDto dto)
    {
        var module = await _context.Modules.Include(m => m.Course).FirstOrDefaultAsync(m => m.Id == moduleId);
        if (module == null) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var role = User.FindFirstValue(ClaimTypes.Role)!;

        if (role != "Admin" && module.Course.LecturerId != userId)
            return Forbid();

        var assignment = new Assignment
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            MaxGrade = dto.MaxGrade,
            ModuleId = moduleId
        };

        _context.Assignments.Add(assignment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { moduleId }, ToDto(assignment));
    }

    [HttpDelete("{assignmentId:guid}")]
    [Authorize(Roles = "Lecturer,Admin")]
    public async Task<IActionResult> Delete(Guid moduleId, Guid assignmentId)
    {
        var assignment = await _context.Assignments.FindAsync(assignmentId);
        if (assignment == null || assignment.ModuleId != moduleId) return NotFound();

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static AssignmentDto ToDto(Assignment a) => new()
    {
        Id = a.Id,
        Title = a.Title,
        Description = a.Description,
        DueDate = a.DueDate,
        MaxGrade = a.MaxGrade,
        ModuleId = a.ModuleId,
        CreatedAt = a.CreatedAt
    };
}

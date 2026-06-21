using System.Security.Claims;
using LMS.Core.DTOs.Announcements;
using LMS.Core.Entities;
using LMS.Core.Interfaces;
using LMS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/courses/{courseId:guid}/announcements")]
[Authorize]
public class AnnouncementsController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly ApplicationDbContext _context;

    public AnnouncementsController(IUnitOfWork uow, ApplicationDbContext context)
    {
        _uow = uow;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AnnouncementDto>>> GetAll(Guid courseId)
    {
        var announcements = await _context.Announcements
            .Include(a => a.Author)
            .Where(a => a.CourseId == courseId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();

        return Ok(announcements.Select(ToDto));
    }

    [HttpPost]
    [Authorize(Roles = "Lecturer,Admin")]
    public async Task<ActionResult<AnnouncementDto>> Create(Guid courseId, CreateAnnouncementDto dto)
    {
        var course = await _uow.Courses.GetByIdAsync(courseId);
        if (course == null) return NotFound();

        var announcement = new Announcement
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Content = dto.Content,
            CourseId = courseId,
            AuthorId = User.FindFirstValue(ClaimTypes.NameIdentifier)!
        };

        _context.Announcements.Add(announcement);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { courseId }, ToDto(announcement));
    }

    private static AnnouncementDto ToDto(Announcement a) => new()
    {
        Id = a.Id,
        Title = a.Title,
        Content = a.Content,
        AuthorName = a.Author?.FullName ?? string.Empty,
        CreatedAt = a.CreatedAt
    };
}

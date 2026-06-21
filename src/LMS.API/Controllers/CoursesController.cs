using System.Security.Claims;
using LMS.Core.DTOs.Courses;
using LMS.Core.Entities;
using LMS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CoursesController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public CoursesController(IUnitOfWork uow) => _uow = uow;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseDto>>> GetAll()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var role = User.FindFirstValue(ClaimTypes.Role)!;

        IEnumerable<Course> courses = role switch
        {
            "Lecturer" => await _uow.Courses.GetByLecturerAsync(userId),
            "Student" => await _uow.Courses.GetEnrolledCoursesAsync(userId),
            _ => await _uow.Courses.GetAllWithLecturerAsync()
        };

        return Ok(courses.Select(ToDto));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CourseDto>> GetById(Guid id)
    {
        var course = await _uow.Courses.GetWithDetailsAsync(id);
        if (course == null) return NotFound();
        return Ok(ToDto(course));
    }

    [HttpPost]
    [Authorize(Roles = "Lecturer,Admin")]
    public async Task<ActionResult<CourseDto>> Create(CreateCourseDto dto)
    {
        if (await _uow.Courses.ExistsByCodeAsync(dto.Code))
            return BadRequest(new { error = $"Course code '{dto.Code}' already exists." });

        var course = new Course
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Code = dto.Code,
            Credits = dto.Credits,
            LecturerId = User.FindFirstValue(ClaimTypes.NameIdentifier)!
        };

        await _uow.Courses.AddAsync(course);
        await _uow.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = course.Id }, ToDto(course));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Lecturer,Admin")]
    public async Task<ActionResult<CourseDto>> Update(Guid id, UpdateCourseDto dto)
    {
        var course = await _uow.Courses.GetByIdAsync(id);
        if (course == null) return NotFound();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var role = User.FindFirstValue(ClaimTypes.Role)!;

        if (role != "Admin" && course.LecturerId != userId)
            return Forbid();

        course.Title = dto.Title;
        course.Description = dto.Description;
        course.Credits = dto.Credits;
        course.IsActive = dto.IsActive;

        _uow.Courses.Update(course);
        await _uow.SaveChangesAsync();

        return Ok(ToDto(course));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var course = await _uow.Courses.GetByIdAsync(id);
        if (course == null) return NotFound();

        _uow.Courses.Remove(course);
        await _uow.SaveChangesAsync();

        return NoContent();
    }

    private static CourseDto ToDto(Course c) => new()
    {
        Id = c.Id,
        Title = c.Title,
        Description = c.Description,
        Code = c.Code,
        Credits = c.Credits,
        IsActive = c.IsActive,
        LecturerId = c.LecturerId,
        LecturerName = c.Lecturer?.FullName ?? string.Empty,
        EnrollmentCount = c.Enrollments?.Count ?? 0,
        CreatedAt = c.CreatedAt
    };
}

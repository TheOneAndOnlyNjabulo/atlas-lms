using System.Security.Claims;
using LMS.Core.DTOs.Enrollments;
using LMS.Core.Entities;
using LMS.Core.Enums;
using LMS.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EnrollmentsController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public EnrollmentsController(IUnitOfWork uow) => _uow = uow;

    [HttpGet("course/{courseId:guid}")]
    [Authorize(Roles = "Lecturer,Admin")]
    public async Task<ActionResult<IEnumerable<EnrollmentDto>>> GetByCourse(Guid courseId)
    {
        var enrollments = await _uow.Enrollments.GetByCourseAsync(courseId);
        return Ok(enrollments.Select(ToDto));
    }

    [HttpPost("course/{courseId:guid}")]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<EnrollmentDto>> Enroll(Guid courseId)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        if (await _uow.Enrollments.IsEnrolledAsync(studentId, courseId))
            return BadRequest(new { error = "Already enrolled in this course." });

        var course = await _uow.Courses.GetByIdAsync(courseId);
        if (course == null || !course.IsActive)
            return NotFound(new { error = "Course not found or inactive." });

        var enrollment = new Enrollment
        {
            Id = Guid.NewGuid(),
            StudentId = studentId,
            CourseId = courseId
        };

        await _uow.Enrollments.AddAsync(enrollment);
        await _uow.SaveChangesAsync();

        var created = await _uow.Enrollments.GetByStudentAndCourseAsync(studentId, courseId);
        return CreatedAtAction(nameof(GetByCourse), new { courseId }, ToDto(created!));
    }

    [HttpDelete("course/{courseId:guid}")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Unenroll(Guid courseId)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var enrollment = await _uow.Enrollments.GetByStudentAndCourseAsync(studentId, courseId);

        if (enrollment == null) return NotFound();

        enrollment.Status = EnrollmentStatus.Dropped;
        _uow.Enrollments.Update(enrollment);
        await _uow.SaveChangesAsync();

        return NoContent();
    }

    private static EnrollmentDto ToDto(Enrollment e) => new()
    {
        Id = e.Id,
        StudentName = e.Student?.FullName ?? string.Empty,
        StudentEmail = e.Student?.Email ?? string.Empty,
        CourseTitle = e.Course?.Title ?? string.Empty,
        CourseCode = e.Course?.Code ?? string.Empty,
        Status = e.Status,
        EnrolledAt = e.EnrolledAt
    };
}

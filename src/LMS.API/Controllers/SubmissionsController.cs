using System.Security.Claims;
using LMS.Core.DTOs.Submissions;
using LMS.Core.Entities;
using LMS.Core.Enums;
using LMS.Core.Interfaces;
using LMS.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LMS.API.Controllers;

[ApiController]
[Route("api/assignments/{assignmentId:guid}/submissions")]
[Authorize]
public class SubmissionsController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly ApplicationDbContext _context;

    public SubmissionsController(IUnitOfWork uow, ApplicationDbContext context)
    {
        _uow = uow;
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "Lecturer,Admin")]
    public async Task<ActionResult<IEnumerable<SubmissionDto>>> GetAll(Guid assignmentId)
    {
        var submissions = await _uow.Submissions.GetByAssignmentAsync(assignmentId);
        return Ok(submissions.Select(ToDto));
    }

    [HttpPost]
    [Authorize(Roles = "Student")]
    public async Task<ActionResult<SubmissionDto>> Submit(Guid assignmentId, SubmitAssignmentDto dto)
    {
        var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        var existing = await _uow.Submissions.GetByStudentAndAssignmentAsync(studentId, assignmentId);
        if (existing != null)
            return BadRequest(new { error = "Already submitted for this assignment." });

        var submission = new Submission
        {
            Id = Guid.NewGuid(),
            AssignmentId = assignmentId,
            StudentId = studentId,
            FilePath = dto.FilePath,
            Notes = dto.Notes,
            Status = SubmissionStatus.Submitted
        };

        await _uow.Submissions.AddAsync(submission);
        await _uow.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { assignmentId }, ToDto(submission));
    }

    [HttpPost("{submissionId:guid}/grade")]
    [Authorize(Roles = "Lecturer,Admin")]
    public async Task<ActionResult<SubmissionDto>> Grade(Guid assignmentId, Guid submissionId, GradeSubmissionDto dto)
    {
        var submission = await _uow.Submissions.GetWithGradeAsync(submissionId);
        if (submission == null || submission.AssignmentId != assignmentId) return NotFound();

        if (submission.Grade != null)
            return BadRequest(new { error = "Submission already graded." });

        var grade = new Grade
        {
            Id = Guid.NewGuid(),
            SubmissionId = submissionId,
            Score = dto.Score,
            Feedback = dto.Feedback,
            GradedById = User.FindFirstValue(ClaimTypes.NameIdentifier)!
        };

        submission.Status = SubmissionStatus.Graded;
        _context.Grades.Add(grade);
        await _context.SaveChangesAsync();

        submission.Grade = grade;
        return Ok(ToDto(submission));
    }

    private static SubmissionDto ToDto(Submission s) => new()
    {
        Id = s.Id,
        StudentName = s.Student?.FullName ?? string.Empty,
        FilePath = s.FilePath,
        Notes = s.Notes,
        Status = s.Status,
        SubmittedAt = s.SubmittedAt,
        Score = s.Grade?.Score,
        Feedback = s.Grade?.Feedback
    };
}

using LMS.Core.Entities;
using LMS.Core.Interfaces;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.Repositories;

public class SubmissionRepository : Repository<Submission>, ISubmissionRepository
{
    public SubmissionRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Submission?> GetWithGradeAsync(Guid id) =>
        await _context.Submissions
            .Include(s => s.Student)
            .Include(s => s.Grade).ThenInclude(g => g!.GradedBy)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<IEnumerable<Submission>> GetByAssignmentAsync(Guid assignmentId) =>
        await _context.Submissions
            .Include(s => s.Student)
            .Include(s => s.Grade)
            .Where(s => s.AssignmentId == assignmentId)
            .ToListAsync();

    public async Task<Submission?> GetByStudentAndAssignmentAsync(string studentId, Guid assignmentId) =>
        await _context.Submissions
            .Include(s => s.Grade)
            .FirstOrDefaultAsync(s => s.StudentId == studentId && s.AssignmentId == assignmentId);
}

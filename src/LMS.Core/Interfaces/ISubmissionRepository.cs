using LMS.Core.Entities;

namespace LMS.Core.Interfaces;

public interface ISubmissionRepository : IRepository<Submission>
{
    Task<Submission?> GetWithGradeAsync(Guid id);
    Task<IEnumerable<Submission>> GetByAssignmentAsync(Guid assignmentId);
    Task<Submission?> GetByStudentAndAssignmentAsync(string studentId, Guid assignmentId);
}

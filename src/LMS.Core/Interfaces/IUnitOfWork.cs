namespace LMS.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    ICourseRepository Courses { get; }
    IEnrollmentRepository Enrollments { get; }
    ISubmissionRepository Submissions { get; }
    Task<int> SaveChangesAsync();
}

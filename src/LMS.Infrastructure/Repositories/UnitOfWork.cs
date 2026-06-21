using LMS.Core.Interfaces;
using LMS.Infrastructure.Data;

namespace LMS.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public ICourseRepository Courses { get; }
    public IEnrollmentRepository Enrollments { get; }
    public ISubmissionRepository Submissions { get; }

    public UnitOfWork(ApplicationDbContext context,
        ICourseRepository courses,
        IEnrollmentRepository enrollments,
        ISubmissionRepository submissions)
    {
        _context = context;
        Courses = courses;
        Enrollments = enrollments;
        Submissions = submissions;
    }

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    public void Dispose() => _context.Dispose();
}

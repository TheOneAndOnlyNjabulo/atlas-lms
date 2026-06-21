using LMS.Core.Entities;
using LMS.Core.Interfaces;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.Repositories;

public class EnrollmentRepository : Repository<Enrollment>, IEnrollmentRepository
{
    public EnrollmentRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Enrollment?> GetByStudentAndCourseAsync(string studentId, Guid courseId) =>
        await _context.Enrollments
            .Include(e => e.Student)
            .Include(e => e.Course)
            .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);

    public async Task<IEnumerable<Enrollment>> GetByCourseAsync(Guid courseId) =>
        await _context.Enrollments
            .Include(e => e.Student)
            .Where(e => e.CourseId == courseId)
            .ToListAsync();

    public async Task<bool> IsEnrolledAsync(string studentId, Guid courseId) =>
        await _context.Enrollments
            .AnyAsync(e => e.StudentId == studentId && e.CourseId == courseId && e.Status == Core.Enums.EnrollmentStatus.Active);
}

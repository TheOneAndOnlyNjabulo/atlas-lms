using LMS.Core.Entities;
using LMS.Core.Interfaces;
using LMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LMS.Infrastructure.Repositories;

public class CourseRepository : Repository<Course>, ICourseRepository
{
    public CourseRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Course?> GetWithDetailsAsync(Guid id) =>
        await _context.Courses
            .Include(c => c.Lecturer)
            .Include(c => c.Modules).ThenInclude(m => m.Assignments)
            .Include(c => c.Enrollments)
            .Include(c => c.Announcements).ThenInclude(a => a.Author)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<IEnumerable<Course>> GetAllWithLecturerAsync() =>
        await _context.Courses
            .Include(c => c.Lecturer)
            .Include(c => c.Enrollments)
            .ToListAsync();

    public async Task<IEnumerable<Course>> GetByLecturerAsync(string lecturerId) =>
        await _context.Courses
            .Include(c => c.Enrollments)
            .Where(c => c.LecturerId == lecturerId)
            .ToListAsync();

    public async Task<IEnumerable<Course>> GetEnrolledCoursesAsync(string studentId) =>
        await _context.Courses
            .Include(c => c.Lecturer)
            .Include(c => c.Enrollments)
            .Where(c => c.Enrollments.Any(e => e.StudentId == studentId && e.Status == Core.Enums.EnrollmentStatus.Active))
            .ToListAsync();

    public async Task<bool> ExistsByCodeAsync(string code) =>
        await _context.Courses.AnyAsync(c => c.Code == code);
}

using LMS.Core.Entities;

namespace LMS.Core.Interfaces;

public interface ICourseRepository : IRepository<Course>
{
    Task<Course?> GetWithDetailsAsync(Guid id);
    Task<IEnumerable<Course>> GetAllWithLecturerAsync();
    Task<IEnumerable<Course>> GetByLecturerAsync(string lecturerId);
    Task<IEnumerable<Course>> GetEnrolledCoursesAsync(string studentId);
    Task<bool> ExistsByCodeAsync(string code);
}

using LMS.Core.Entities;

namespace LMS.Core.Interfaces;

public interface IEnrollmentRepository : IRepository<Enrollment>
{
    Task<Enrollment?> GetByStudentAndCourseAsync(string studentId, Guid courseId);
    Task<IEnumerable<Enrollment>> GetByCourseAsync(Guid courseId);
    Task<bool> IsEnrolledAsync(string studentId, Guid courseId);
}

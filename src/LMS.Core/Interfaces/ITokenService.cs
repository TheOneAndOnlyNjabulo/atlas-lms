using LMS.Core.Entities;

namespace LMS.Core.Interfaces;

public interface ITokenService
{
    string CreateToken(ApplicationUser user);
}

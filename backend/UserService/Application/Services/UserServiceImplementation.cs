using UserService.Application.DTOs;
using UserService.Application.Interfaces;
using UserService.Domain.Entities;

namespace UserService.Application.Services;

public class UserServiceImplementation : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserServiceImplementation(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToDto);
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user == null ? null : MapToDto(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto createUserDto)
    {
        var existing = await _userRepository.GetByEmailAsync(createUserDto.Email);
        if (existing != null)
        {
            throw new InvalidOperationException($"Ya existe un usuario registrado con el correo {createUserDto.Email}.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = createUserDto.Email.Trim(),
            Username = createUserDto.Username.Trim(),
            FullName = createUserDto.FullName.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return MapToDto(user);
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Username = user.Username,
            FullName = user.FullName,
            CreatedAt = user.CreatedAt
        };
    }
}

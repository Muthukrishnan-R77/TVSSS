using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Tvss.AdminBackend.DTOs;
using Tvss.AdminBackend.Services;

namespace Tvss.AdminBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new LoginResponseDto { Success = false, Message = "Invalid payload" });
            }

            var result = await _authService.LoginAsync(request);
            if (!result.Success)
            {
                return Unauthorized(result);
            }

            return Ok(result);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            // Stateless JWT logout (client discards token)
            return Ok(new { success = true, message = "Logged out successfully" });
        }
    }
}

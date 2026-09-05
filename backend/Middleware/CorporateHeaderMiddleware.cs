using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Threading.Tasks;

namespace ProyectoSubasta.Api.Middleware
{
    public class CorporateHeaderMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<CorporateHeaderMiddleware> _logger;

        public CorporateHeaderMiddleware(RequestDelegate next, ILogger<CorporateHeaderMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                context.Response.OnStarting(() =>
                {
                    context.Response.Headers["X-Api-version"] = "1.0";
                    return Task.CompletedTask;
                });

                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError("[CODE-ERROR] - Error in CorporateHeaderMiddleware: {Message}", ex.Message);
                throw;
            }
        }
    }
}

using System;
using System.IO;
using System.Threading.Tasks;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace MyEventz.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UploadController : ControllerBase
    {
        private readonly Cloudinary _cloudinary;

        public UploadController(IConfiguration configuration)
        {
            var cloudName = configuration["Cloudinary:CloudName"];
            var apiKey = configuration["Cloudinary:ApiKey"];
            var apiSecret = configuration["Cloudinary:ApiSecret"];

            if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
            {
                throw new InvalidOperationException("Cloudinary configuration is missing keys.");
            }

            var account = new Account(cloudName, apiKey, apiSecret);
            _cloudinary = new Cloudinary(account);
        }

        [HttpPost]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No se ha enviado ningún archivo.");

            // Allow only image files
            if (!file.ContentType.StartsWith("image/"))
                return BadRequest("El archivo enviado no es una imagen válida.");

            try
            {
                using var stream = file.OpenReadStream();
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = "myeventz",
                    Transformation = new Transformation().Quality("auto").FetchFormat("auto")
                };

                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                {
                    return StatusCode(500, $"Error de Cloudinary: {uploadResult.Error.Message}");
                }

                return Ok(new { url = uploadResult.SecureUrl.ToString() });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno al subir la imagen: {ex.Message}");
            }
        }
    }
}

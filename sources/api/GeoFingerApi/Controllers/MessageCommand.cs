using GeoFingerApi.Model;
using GeoFingerApi.Services;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace GeoFingerApi.Controllers
{
    [ApiController]
    [EnableCors]
    [Route("geofinger/api/messages")]
    public class MessageCommand : ControllerBase
    {



        private readonly ILogger<MessageCommand> _logger;
        private readonly IFingerDataStore dataStore;

        public MessageCommand(ILogger<MessageCommand> logger, IFingerDataStore dataStore)
        {
            _logger = logger;
            this.dataStore = dataStore;
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MessageContainer post)
        {
            dataStore.AddMessageContainer(post, DateTime.Now.ToString());

            return new OkResult();

        }

        [HttpGet]
        public async Task<ActionResult> Get(decimal lat, decimal lon)
        {
            string jsonified = JsonSerializer.Serialize(dataStore.GetNearbyMessages(lat, lon));
            return new ContentResult() { Content = jsonified, StatusCode = 200, ContentType = "application/json" };
        }





    }
}
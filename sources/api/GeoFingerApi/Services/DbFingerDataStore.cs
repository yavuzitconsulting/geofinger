using GeoFingerApi.Model;
using Microsoft.EntityFrameworkCore;

namespace GeoFingerApi.Services
{
    public class DbFingerDataStore : IFingerDataStore
    {
        Context context;
        List<MessageDataStore> messages;
        ILogger<DbFingerDataStore> logger;

        public DbFingerDataStore(ILogger<DbFingerDataStore> logger, Context context)
        {

            Console.WriteLine("Using Database Datastore");
            Console.WriteLine("#######################");
            this.context = context;
            this.logger = logger;
            this.messages = new List<MessageDataStore>();

            try
            {

                context.Database.EnsureCreated();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

            try
            {
                Console.WriteLine("DEBUG: WRITING DOWN ALL MESSAGES ON INSTANCE CREATION");
                foreach (var message in this.context.MessageData)
                {
                    Console.WriteLine($"MSG: {message.message}, LAT: {message.lat}, LON: {message.lon}");
                }
                Console.WriteLine("#######################");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.ToString());
            }

        }

        public string[] GetMessages(decimal lat, decimal lon)
        {
            return context.MessageData.Where(x => x.lat == lat && x.lon == lon).Select(x => "\"" + x.message + "\"" + " @ " + x.timestamp).ToArray();
        }



        public string[] GetNearbyMessages(decimal lat, decimal lon)
        {
            Console.WriteLine($"REQUESTING LOOKUP FOR LAT {lat} and LON {lon} in a ~40m radius");
            Console.WriteLine($"LAT TRANSLATES TO A LOOKUP BETWEEN: {lat - (decimal)0.0003} AND {lat + (decimal)0.0003}");
            Console.WriteLine($"LON TRANSLATES TO A LOOKUP BETWEEN: {lon - (decimal)0.0003} AND {lon + (decimal)0.0003}");


            string[] data = context.MessageData.Where(Constants.retrieveFunc(lat, lon)).Select(Constants.selectFunc()).ToArray();
            foreach (string s in data)
            {
                Console.WriteLine($"Following messages were found between these values: {s}");
            }
            return data;
        }


        public void AddMessageContainer(MessageContainer messageContainer, string timeStamp)
        {
            if (context.MessageData.Any(x => x.lon == messageContainer.lon && x.lat == messageContainer.lat && x.message == messageContainer.message && x.timestamp == timeStamp)) return;

            Console.WriteLine($"@[{timeStamp}]: KNOCK, KNOCK! Someone left a message! '{messageContainer.message}' @ GEOLOCATION LAT: {messageContainer.lat} LON: {messageContainer.lon}, where may that be?");
            context.MessageData.Add(new MessageDataStore() { lat = messageContainer.lat, lon = messageContainer.lon, message = messageContainer.message, timestamp = timeStamp });
            context.SaveChanges();
        }
    }
}

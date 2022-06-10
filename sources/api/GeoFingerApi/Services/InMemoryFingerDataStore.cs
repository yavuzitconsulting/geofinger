using GeoFingerApi.Model;
using Microsoft.EntityFrameworkCore;

namespace GeoFingerApi.Services
{
    public class InMemoryFingerDataStore : IFingerDataStore
    {
        List<MessageDataStore> messages;
        ILogger<InMemoryFingerDataStore> logger;


        public InMemoryFingerDataStore(ILogger<InMemoryFingerDataStore> logger)
        {
            Console.WriteLine("Using InMemory Datastore");
            Console.WriteLine("#######################");
            this.logger = logger;
            this.messages = new List<MessageDataStore>();
            MessageDataStore m = new MessageDataStore();
            m.timestamp = DateTime.Now.ToString();
            m.lat = (decimal)51.5307894;
            m.lon = (decimal)8.0235745;
            m.message = "TEST";
            messages.Add(m);


            MessageDataStore m2 = new MessageDataStore();
            m2.timestamp = DateTime.Now.ToString();
            m2.lat = (decimal)51.5309894;
            m2.lon = (decimal)8.0235845;
            m2.message = "TEST2";
            messages.Add(m2);


            try
            {
                Console.WriteLine("DEBUG: WRITING DOWN ALL MESSAGES ON INSTANCE CREATION");
                foreach (var message in this.messages)
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
            return this.messages.Where(x => x.lat == lat && x.lon == lon).Select(x => "\"" + x.message + "\"" + " @ " + x.timestamp).ToArray();
        }


        public string[] GetNearbyMessages(decimal lat, decimal lon)
        {
            Console.WriteLine($"REQUESTING LOOKUP FOR LAT {lat} and LON {lon} in a ~40m radius");
            Console.WriteLine($"LAT TRANSLATES TO A LOOKUP BETWEEN: {lat - (decimal)0.0003} AND {lat + (decimal)0.0003}");
            Console.WriteLine($"LON TRANSLATES TO A LOOKUP BETWEEN: {lon - (decimal)0.0003} AND {lon + (decimal)0.0003}");


            string[] data = this.messages.Where(Constants.retrieveFunc(lat, lon)).Select(Constants.selectFunc()).ToArray();
            foreach (string s in data)
            {
                Console.WriteLine($"Following messages were found between these values: {s}");
            }
            return data;
        }

        public void AddMessageContainer(MessageContainer messageContainer, string timeStamp)
        {
            Console.WriteLine($"@[{timeStamp}]: KNOCK, KNOCK! Someone left a message! '{messageContainer.message}' @ GEOLOCATION LAT: {messageContainer.lat} LON: {messageContainer.lon}, where may that be?");
            this.messages.Add(new MessageDataStore() { lat = messageContainer.lat, lon = messageContainer.lon, message = messageContainer.message, timestamp = timeStamp });

        }




    }
}

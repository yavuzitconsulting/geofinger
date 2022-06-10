using GeoFingerApi.Model;

namespace GeoFingerApi.Services
{
    public static class Constants
    {

        public static Func<MessageDataStore, bool> retrieveFunc(decimal lat, decimal lon)
        {
            return x =>
              (x.lat >= (lat - (decimal)0.0003)) &&
              (x.lat <= (lat + (decimal)0.0003)) &&
              (x.lon >= (lon - (decimal)0.0003)) &&
              (x.lon <= (lon + (decimal)0.0003));
        }

        public static Func<MessageDataStore, string> selectFunc()
        {
            return x => "\"" + x.message + "\"" + " @ " + x.timestamp;
        }

    }
}

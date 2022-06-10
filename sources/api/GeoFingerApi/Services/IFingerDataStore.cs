using GeoFingerApi.Model;

namespace GeoFingerApi.Services
{
    public interface IFingerDataStore
    {
        string[] GetMessages(decimal lat, decimal lon);
        string[] GetNearbyMessages(decimal lat, decimal lon);
        void AddMessageContainer(MessageContainer messageContainer, string timestamp);
    }
}

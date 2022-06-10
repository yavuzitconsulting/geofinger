namespace GeoFingerApi.Model
{
    public class MessageDataStore
    {
        public int Id { get; set; }
        public string message { get; set; }
        public decimal lat { get; set; }
        public decimal lon { get; set; }
        public string timestamp { get; set; }
    }
}

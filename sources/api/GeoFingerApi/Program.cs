using GeoFingerApi.Model;
using GeoFingerApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
string storeMode = builder.Configuration["StorageMode"];
switch (storeMode.ToLower())
{
    case "inmemory":
        builder.Services.AddSingleton(typeof(IFingerDataStore), typeof(InMemoryFingerDataStore));
        break;

    case "database":
        builder.Services.AddScoped(typeof(IFingerDataStore), typeof(DbFingerDataStore));
        break;

    default: throw new ArgumentException("Storage Mode settings must be 'database' or 'inmemory'");
}
//builder.Services.AddCors(options =>
//{
//    options.AddDefaultPolicy(
//        builder =>
//        {
//            builder.WithOrigins("https://localhost:44351", "http://localhost:4200")
//                                .AllowAnyHeader()
//                                .AllowAnyMethod();
//        });
//});
builder.Services.AddDbContext<Context>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.UseCors(builder =>
{
    builder
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader();
});
Console.Write("RUN");
app.Run();

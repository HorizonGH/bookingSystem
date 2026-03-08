FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["src/Booking.WebApi/Booking.WebApi.csproj", "Booking.WebApi/"]
COPY ["src/Booking.Application/Booking.Application.csproj", "Booking.Application/"]
COPY ["src/Booking.Domain/Booking.Domain.csproj", "Booking.Domain/"]
COPY ["src/Booking.Infrastructure/Booking.Infrastructure.csproj", "Booking.Infrastructure/"]
RUN dotnet restore "Booking.WebApi/Booking.WebApi.csproj"

COPY src/ .
WORKDIR "/src/Booking.WebApi"
RUN dotnet build "Booking.WebApi.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Booking.WebApi.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Booking.WebApi.dll"]

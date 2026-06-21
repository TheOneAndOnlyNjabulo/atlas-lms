FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/LMS.API/LMS.API.csproj", "src/LMS.API/"]
COPY ["src/LMS.Core/LMS.Core.csproj", "src/LMS.Core/"]
COPY ["src/LMS.Infrastructure/LMS.Infrastructure.csproj", "src/LMS.Infrastructure/"]
RUN dotnet restore "src/LMS.API/LMS.API.csproj"
COPY . .
RUN dotnet build "src/LMS.API/LMS.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "src/LMS.API/LMS.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "LMS.API.dll"]

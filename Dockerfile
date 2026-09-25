FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["EduSupport.Api/EduSupport.Api.csproj", "EduSupport.Api/"]
RUN dotnet restore "EduSupport.Api/EduSupport.Api.csproj"

COPY . .
WORKDIR "/src/EduSupport.Api"
RUN dotnet publish "EduSupport.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://0.0.0.0:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "EduSupport.Api.dll"]
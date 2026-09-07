FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["AuctionWorker/AuctionWorker.csproj", "AuctionWorker/"]
RUN dotnet restore "AuctionWorker/AuctionWorker.csproj"
COPY . .
WORKDIR "/src/AuctionWorker"
RUN dotnet build "AuctionWorker.csproj" -c Release -o /app/build
RUN dotnet publish "AuctionWorker.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AuctionWorker.dll"]

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["WalletService/WalletService.csproj", "WalletService/"]
RUN dotnet restore "WalletService/WalletService.csproj"
COPY . .
WORKDIR "/src/WalletService"
RUN dotnet build "WalletService.csproj" -c Release -o /app/build
RUN dotnet publish "WalletService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 5002
ENV ASPNETCORE_URLS=http://+:5002
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "WalletService.dll"]

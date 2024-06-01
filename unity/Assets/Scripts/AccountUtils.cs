using System.Text.Json;
using System.Threading.Tasks;

using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.DependencyInjection;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking;
using Newtonsoft.Json.Linq;

[System.Serializable]
public class AddressObject
{
    public string[] addresses;
}

public static class ChainDataProvider
{
    public const string EventsEndpoint = "https://api.tzkt.io/v1/ws";
    public const string EventsChannel = "accounts";
    public const string EventsStream = "SubscribeToAccounts";
}

public class AccountUtils : MonoBehaviour
{
    private HubConnection connection;

    public async Task StartListeningForOnChainEvents(string address)
    {
        connection = new HubConnectionBuilder()
            .WithUrl(ChainDataProvider.EventsEndpoint)
            .WithAutomaticReconnect()
            .Build();
        await connection.StartAsync();

         AddressObject addressObject = new AddressObject
        {
            addresses = new string[] { address }
        };

        connection.On<object>(ChainDataProvider.EventsChannel, data => {
            // update UI based on account events
            Debug.Log(data);
        });

         await connection.InvokeAsync(ChainDataProvider.EventsStream, addressObject);
    }

    public IEnumerator fetchTokensBalances(string address)
    {
        var request = new UnityWebRequest($"https://api.tzkt.io/v1/tokens/balances?account={address}&limit=10000", "GET");
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");
        yield return request.SendWebRequest();

        var rawData = request.downloadHandler.text; 
        Debug.Log(rawData);
    }
}

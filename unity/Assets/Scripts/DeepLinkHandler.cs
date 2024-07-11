using UnityEngine;
using System.Collections;
using System;
using System.Web;
using UnityEngine.UI;

public class DeepLinkHandler : MonoBehaviour
{
    public Text addressValue;
    public Text addressTitle;
    public Text opHashTitle;
    public Text opHashValue;
    public Button signInButton;
    public Button sendOperation;

    public static DeepLinkHandler Instance { get; private set; }
    public string deeplinkURL;

    void Start() {
        addressTitle.gameObject.SetActive(false);
        addressValue.gameObject.SetActive(false);
        opHashTitle.gameObject.SetActive(false);
        opHashValue.gameObject.SetActive(false);
        sendOperation.gameObject.SetActive(false);
    }

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;                
            Application.deepLinkActivated += onDeepLinkActivated;
            if (!string.IsNullOrEmpty(Application.absoluteURL))
            {
                // Cold start and Application.absoluteURL not null so process Deep Link.
                onDeepLinkActivated(Application.absoluteURL);
            }
            // Initialize DeepLink Manager global variable.
            else deeplinkURL = "[none]";
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
        }
    }
 
    private void onDeepLinkActivated(string url)
    {
        deeplinkURL = url;
        Console.WriteLine(deeplinkURL); // prints the deeplink url that was received 

        Uri httpUrl = new Uri(url);
        var queryParameters = HttpUtility.ParseQueryString(httpUrl.Query);
        string errorMessage = queryParameters["errorMessage"];
        string errorId = queryParameters["errorId"];

        if (!string.IsNullOrEmpty(errorMessage))
        {
            Console.WriteLine($"Error: {errorMessage}\nErrorId: {errorId}");
            return;
        }

        string address = url.Split("?address=")[1].Split('&')[0];
        string typeOfLogin = url.Split("&typeOfLogin=")[1].Split('&')[0];

        signInButton.gameObject.SetActive(false);
        sendOperation.gameObject.SetActive(true);
        addressValue.gameObject.SetActive(true);
        addressTitle.gameObject.SetActive(true);
        
        Singleton.Instance.TypeOfLogin = typeOfLogin;
        Singleton.Instance.Address = address;
        addressValue.text = "Address: " +  address.Substring(0, 4) + "..." + address.Substring(address.Length - 4);

        const string operationHashKey = "&operationHash=";

        if (!url.Contains(operationHashKey)) {
            return;
        }

        string operationHash = url.Split("&operationHash=")[1];

        opHashTitle.gameObject.SetActive(true);
        opHashValue.gameObject.SetActive(true); 
        opHashValue.text = operationHash;
    }
}

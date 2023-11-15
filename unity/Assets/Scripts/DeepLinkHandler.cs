using UnityEngine;
using System.Collections;
using UnityEngine.UI;

public class DeepLinkHandler : MonoBehaviour
{
    public Text textfield;
    public Button signInButton;
    public Button sendOperation;

    public static DeepLinkHandler Instance { get; private set; }
    public string deeplinkURL;

    void Start() {
        textfield.gameObject.SetActive(false);
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
        string address = url.Split("?address=")[1].Split('&')[0];

        signInButton.gameObject.SetActive(false);
        sendOperation.gameObject.SetActive(true);
        textfield.gameObject.SetActive(true);
        
        textfield.text = "Address: " +  address.Substring(0, 4) + "..." + address.Substring(address.Length - 4);
        WebViewController.buyURL = $"https://global.transak.com/?apiKey=f1336570-699b-4181-9bd1-cdd57206981f&cryptoCurrencyCode=XTZ&walletAddressesData={{\"coins\":{{\"XTZ\":{{\"address\":\"{address}\"}}}}}}&fiatAmount=30&fiatCurrency=USD&hideMenu=true&isFeeCalculationHidden=true&disableWalletAddressForm=true";
    }
}

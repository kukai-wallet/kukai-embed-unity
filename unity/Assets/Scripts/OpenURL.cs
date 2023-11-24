using UnityEngine;
using UnityEngine.UI;
using System.Text.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;

public class OpenURL : MonoBehaviour
{
    public string deepLinkURL = "http://localhost:3000";

    public void SendToBrowser()
    {
        Application.OpenURL(deepLinkURL);
    }

    public void SendOperation()
    {
        JArray arrayOfOperations = new JArray();

        JObject operationPayload = new JObject();
        operationPayload["kind"] = "transaction";
        operationPayload["amount"] = "12345";
        operationPayload["destination"] = "tz2SxeQwLfqA2Fr1ink3B8V7uWNrPWJakEYo";

        arrayOfOperations.Add(operationPayload);

        string encodedParams = JsonConvert.SerializeObject(arrayOfOperations);

        string fullOperationURL = deepLinkURL + "?operationPayload=" + WWW.EscapeURL(encodedParams + $"&address={ActiveAccount.address}");

        Application.OpenURL(fullOperationURL);
    }
}

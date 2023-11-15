using UnityEngine;
using UnityEngine.UI;
using System.Diagnostics;

public class OpenURL : MonoBehaviour
{
    public string deepLinkURL = "http://localhost:3000";

    public void SendToBrowser()
    {
        Application.OpenURL(deepLinkURL);
    }
}

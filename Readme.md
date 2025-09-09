# Authorization
--------------------
Entra ID is needed to authenticate the client. Your application needs an object that implements the TokenCredential interface. Code samples here use DefaultAzureCredential. To get that working, you will need:
 - The Contributor role. Role assigned can be done via the "Access Control (IAM)" tab of your Azure AI Project resource in the Azure portal. Learn more about role assignments here. (i did not do this step so it may have been done automatically)
 - Azure CLI installed.
 - You are logged into your Azure account by running az login (you need to have am Azure subscription, for example from a free account).
 - Note that if you have multiple Azure subscriptions, the subscription that contains your Azure AI Project resource must be your default subscription. Run az account list --output table to list all your subscription and see which one is the default. Run az account set --subscription "Your Subscription ID or Name" to change your default subscription.

# Auth remark:
 - example1_chatCompletion.js uses the EntraId to authenticate (you need to run az login locally)
 - example2_chatCompletion.js does NOT use EntraId but uses an API key
 - example3_codeInterpreter.js uses the EntraId to authenticate (you need to run az login locally)
 - example4_fileSearch.js uses the EntraId to authenticate (you need to run az login locally)

# Example Run project samples:
node example1_chatCompletion.js

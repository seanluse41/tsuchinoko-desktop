<script>
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
  import { openUrl } from "@tauri-apps/plugin-opener";

  let name = $state("");
  let greetMsg = $state("");
  let test = $state("nothing");
  let accessToken = $state(null);

  const config = {
    clientId: "l.1.4b3hnz7sl7hn1zax2xhilc8p0qtp6rq1",
    authEndpoint: "https://sean.kintone.com/oauth2/authorization",
    redirectUri: "https://redirectmeto.com/tsuchinoko://",
    scope: "k:app_settings:read k:app_settings:write",
  };

  function generateState() {
    return Math.random().toString(36).substring(7);
  }

  async function initiateKintoneLogin() {
    const state = generateState();
    localStorage.setItem("kintone_state", state);

    const authUrl = new URL(config.authEndpoint);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", config.clientId);
    authUrl.searchParams.append("redirect_uri", config.redirectUri);
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("scope", config.scope);

    try {
      await openUrl(authUrl.toString());
      console.log("Opened browser for Kintone login");
    } catch (err) {
      console.error("Failed to open browser:", err);
    }
  }

  async function handleAuthCallback(url) {
    const parsedUrl = new URL(url);
    const code = parsedUrl.searchParams.get("code");
    const state = parsedUrl.searchParams.get("state");

    const savedState = localStorage.getItem("kintone_state");
    if (state !== savedState) {
      console.error("State mismatch - possible CSRF attack");
      return;
    }

    if (code) {
      try {
        const tokenResponse = await invoke("kintone_exchange_token", {
          code,
          redirectUri: config.redirectUri,
        });

        accessToken = tokenResponse.access_token;
        console.log("Successfully authenticated with Kintone");
      } catch (error) {
        console.error("Error exchanging code for token:", error);
      }
    }
  }

  onMount(async () => {
    console.log("the component has mounted");
    await onOpenUrl((urls) => {
      console.log("deep link:", urls);
      test = urls[0];
      handleAuthCallback(urls[0]);
    });
  });

  async function greet(event) {
    event.preventDefault();
    greetMsg = await invoke("greet", { name });
  }
</script>

<main
  class="flex flex-col items-center justify-center font-sans text-ebony-800"
>
  <div class="w-full max-w-md p-8">
    <form class="flex justify-center mb-6" onsubmit={greet}>
      <input
        id="greet-input"
        placeholder="Enter a name..."
        bind:value={name}
        class="mr-2 px-4 py-2 rounded-lg border border-thistle-300 bg-white focus:outline-none focus:border-moss_green-500 shadow-sm"
      />
      <button
        type="submit"
        class="px-4 py-2 rounded-lg bg-moss_green-500 text-white hover:bg-moss_green-600 active:bg-moss_green-700 shadow-sm transition-colors"
      >
        Greet
      </button>
    </form>

    <button
      class="w-full px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-sm transition-colors mb-4"
      onClick={initiateKintoneLogin}
    >
      Login with Kintone
    </button>

    {#if greetMsg}
      <p class="text-center mb-2">{greetMsg}</p>
    {/if}

    {#if test !== "nothing"}
      <p class="text-center mb-2">{test}</p>
    {/if}

    {#if accessToken}
      <p class="text-center text-moss_green-700 font-medium">
        Successfully logged in to Kintone!
      </p>
    {/if}
  </div>
</main>

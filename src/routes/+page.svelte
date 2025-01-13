<script>
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { Card, Heading, P, Img, Button, Spinner } from "svelte-5-ui-lib";
  import ParticleBackground from '../components/ParticleBackground.svelte';

  let test = $state("nothing");
  let accessToken = $state(null);
  let isLoading = $state(false);

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
    isLoading = true;
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
      isLoading = false;
    }
  }

  async function handleAuthCallback(url) {
    const parsedUrl = new URL(url);
    const code = parsedUrl.searchParams.get("code");
    const state = parsedUrl.searchParams.get("state");

    const savedState = localStorage.getItem("kintone_state");
    if (state !== savedState) {
      console.error("State mismatch - possible CSRF attack");
      isLoading = false;
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
    isLoading = false;
  }

  onMount(async () => {
    await onOpenUrl((urls) => {
      console.log("deep link:", urls);
      test = urls[0];
      handleAuthCallback(urls[0]);
    });
  });
</script>

<ParticleBackground />

<main class="flex min-h-screen w-full items-center justify-center bg-amber-900">
  <Card class="max-w-none w-3/4 p-8 z-10">
    <div class="mb-8 flex justify-center">
      <Img
        src="logo_kintone_mark_rgb.png"
        alt="Kintone Logo"
        class="h-16 w-auto"
      />
    </div>
    <div class="flex flex-col items-center">
      <Heading level={1} class="mb-6 text-center text-ebony-200">
        Tsuuchinoko
      </Heading>

      <P class="mb-8 text-center text-ebony-200">
        Connect with your Kintone workspace to get started
      </P>

      <Button
        class="w-3/4 rounded-lg bg-amber px-8 py-8 text-black hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-thistle focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={initiateKintoneLogin}
        disabled={isLoading}
        size="xl"
      >
        {#if isLoading}
          <span class="absolute inset-0 flex items-center justify-center">
            <Spinner size="sm" />
          </span>
          <span class="opacity-0">Login with Kintone</span>
        {:else}
          Login with Kintone
        {/if}
      </Button>
    </div>
    {#if accessToken}
      <Card class="mt-6 bg-green-50 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-moss_green-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <P class="text-sm font-medium text-green-800">
              Successfully connected to Kintone!
            </P>
          </div>
        </div>
      </Card>
    {/if}
  </Card>
</main>

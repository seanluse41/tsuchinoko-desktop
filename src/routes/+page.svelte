<script>
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
  import { open } from "@tauri-apps/plugin-shell";
  import { Card, Heading, P, Img, Button, Spinner } from "svelte-5-ui-lib";
  import ParticleBackground from "../components/ParticleBackground.svelte";

  let test = $state("nothing");
  let accessToken = $state(null);
  let isLoading = $state(false);
  let error = $state(null);

  const config = {
    clientId: "l.1.4b3hnz7sl7hn1zax2xhilc8p0qtp6rq1",
    authEndpoint: "https://sean.kintone.com/oauth2/authorization",
    redirectUri: "https://seanbase.com/tsuuchinoko-auth",
    scope: "k:app_settings:read k:app_settings:write",
  };

  function generateState() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  async function initiateKintoneLogin() {
    try {
      console.log("Login button clicked");
      isLoading = true;
      error = null;

      const state = generateState();
      localStorage.setItem("kintone_state", state);

      const authUrl = new URL(config.authEndpoint);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("client_id", config.clientId);
      authUrl.searchParams.append("redirect_uri", config.redirectUri);
      authUrl.searchParams.append("state", state);
      authUrl.searchParams.append("scope", config.scope);

      console.log("Opening URL:", authUrl.toString());
      await open(authUrl.toString());
    } catch (err) {
      console.error("Failed to open browser:", err);
      error = "Failed to open login page. Please try again.";
    }
  }

  async function handleAuthCallback(url) {
    try {
      console.log("Handling auth callback with URL:", url);
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get("code");
      const state = parsedUrl.searchParams.get("state");
      const authError = parsedUrl.searchParams.get("error");

      if (authError) {
        throw new Error(`Authentication error: ${authError}`);
      }

      const savedState = localStorage.getItem("kintone_state");
      if (!savedState || state !== savedState) {
        throw new Error("State mismatch - possible CSRF attack");
      }

      if (!code) {
        throw new Error("No authorization code received");
      }

      const tokenResponse = await invoke("kintone_exchange_token", {
        code,
        redirectUri: config.redirectUri,
      });

      if (!tokenResponse || !tokenResponse.access_token) {
        throw new Error("Invalid token response");
      }

      accessToken = tokenResponse.access_token;
      console.log("Successfully authenticated with Kintone");
    } catch (err) {
      console.error("Authentication error:", err);
      error = err.message || "Authentication failed. Please try again.";
      accessToken = null;
    } finally {
      isLoading = false;
    }
  }

  onMount(async () => {
    try {
      const unsubscribe = await onOpenUrl((url) => {
        console.log("Received URL:", url);
        handleAuthCallback(url);
      });

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error("Failed to setup deep link handler:", err);
      error = "Failed to initialize app. Please restart.";
    }
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

      {#if error}
        <div class="mb-4 w-full rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <P class="text-sm font-medium text-red-800">
                {error}
              </P>
            </div>
          </div>
        </div>
      {/if}

      <div class="flex flex-col gap-4 w-full justify-center items-center">
        <Button
          class="lg:w-3/4 rounded-lg bg-amber px-8 py-8 text-black hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-thistle focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onclick={() => {
            console.log("Raw button click");
            initiateKintoneLogin();
          }}
          disabled={isLoading}
          size="xl"
        >
          {#if isLoading}
            <Spinner class="me-3" size="8" color="teal" /><P class="text-xl"
              >Loading ...</P
            >
          {:else}
            <P class="text-xl">Login with Kintone</P>
          {/if}
        </Button>

        <Button
          class="lg:w-3/4 rounded-lg bg-thistle px-8 py-8 text-black hover:bg-thistle-700 focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2"
          href="/setup"
          size="xl"
        >
          <P class="text-xl">First Time Setup</P>
        </Button>
      </div>
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

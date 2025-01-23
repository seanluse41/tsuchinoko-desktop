<!-- src/routes/(auth)/login/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { invoke } from "@tauri-apps/api/core";
  import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
  import { open } from "@tauri-apps/plugin-shell";
  import { Card, Heading, P, Img, Button, Spinner } from "svelte-5-ui-lib";
  import ParticleBackground from "../../../components/ParticleBackground.svelte";
  import { secretManager } from "../../../requests/appSecretManager";

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
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  async function initiateKintoneLogin() {
    try {
      isLoading = true;
      error = null;

      const state = generateState();
      await secretManager.storeSecret("kintone_state", state);

      const authUrl = new URL(config.authEndpoint);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("client_id", config.clientId);
      authUrl.searchParams.append("redirect_uri", config.redirectUri);
      authUrl.searchParams.append("state", state);
      authUrl.searchParams.append("scope", config.scope);

      await open(authUrl.toString());
    } catch (err) {
      console.error("Failed to open browser:", err);
      error = "Failed to open login page. Please try again.";
      isLoading = false;
    }
  }

  async function handleAuthCallback(url) {
    try {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get("code");
      const state = parsedUrl.searchParams.get("state");
      const authError = parsedUrl.searchParams.get("error");

      if (authError) {
        throw new Error(`Authentication error: ${authError}`);
      }

      const savedState = await secretManager.getSecret("kintone_state");
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

      // Store token in Stronghold
      await secretManager.storeSecret("kintone_access_token", tokenResponse.access_token);
      
      // Navigate to home page
      await goto('/home');
    } catch (err) {
      console.error("Authentication error:", err);
      error = err.message || "Authentication failed. Please try again.";
    } finally {
      isLoading = false;
    }
  }

  onMount(async () => {
    try {
      const unsubscribe = await onOpenUrl((url) => {
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
    <div class="flex flex-col items-center gap-8">
      <Heading level={1} class="mb-6 text-center text-ebony-200">
        Tsuuchinoko
      </Heading>
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
          onclick={initiateKintoneLogin}
          disabled={isLoading}
          size="xl"
        >
          {#if isLoading}
            <Spinner class="me-3" size="8" color="teal" />
            <P class="text-xl">Loading ...</P>
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
  </Card>
</main>
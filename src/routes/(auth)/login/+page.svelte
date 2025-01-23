<!-- src/routes/(auth)/login/+page.svelte -->
<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { open } from "@tauri-apps/plugin-shell";
  import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
  import { Card, Heading, P, Img, Button, Spinner } from "svelte-5-ui-lib";
  import { buildAuthUrl, validateState } from "../../../lib/kintoneAuthRequest";
  import { exchangeToken } from "../../../lib/kintoneAccessRequest";
  import { authState } from "../../../lib/appLoginManager.svelte.js";

  async function initiateKintoneLogin() {
    try {
      authState.isLoading = true;
      authState.error = null;
      const authUrl = buildAuthUrl(authState.user.subdomain, authState.user.clientId);
      await open(authUrl.toString());
    } catch (err) {
      console.error("Failed to open browser:", err);
      authState.error = "Failed to open login page. Please try again.";
      authState.isLoading = false;
    }
  }

  async function handleAuthCallback(url) {
    try {
      const parsedUrl = new URL(url);
      const code = parsedUrl.searchParams.get("code");
      const state = parsedUrl.searchParams.get("state");
      const authError = parsedUrl.searchParams.get("error");

      if (authError) throw new Error(`Authentication error: ${authError}`);
      
      const [stateValid, tokenResponse] = await Promise.all([
        validateState(state),
        code ? exchangeToken(code) : Promise.reject(new Error("No authorization code received"))
      ]);

      if (!stateValid) throw new Error("State mismatch");

      authState.isAuthenticated = true;
      await goto('/home');
    } catch (err) {
      authState.error = err.message || "Authentication failed";
    } finally {
      authState.isLoading = false;
    }
  }

  onMount(async () => {
    try {
      return await onOpenUrl(handleAuthCallback);
    } catch (err) {
      authState.error = "Failed to initialize app. Please restart.";
    }
  });
</script>

<main class="flex min-h-screen w-full items-center justify-center bg-amber-900">
  <Card class="max-w-none w-3/4 p-8 z-10">
    <div class="mb-8 flex justify-center">
      <Img src="logo_kintone_mark_rgb.png" alt="Kintone Logo" class="h-16 w-auto" />
    </div>
    <div class="flex flex-col items-center gap-8">
      <Heading level={1} class="mb-6 text-center text-ebony-200">
        Tsuuchinoko
      </Heading>
      
      {#if authState.error}
        <div class="mb-4 w-full rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <P class="text-sm font-medium text-red-800">{authState.error}</P>
            </div>
          </div>
        </div>
      {/if}

      <div class="flex flex-col gap-4 w-full justify-center items-center">
        <Button
          class="lg:w-3/4 rounded-lg bg-amber px-8 py-8 text-black hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-thistle focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onclick={initiateKintoneLogin}
          disabled={authState.isLoading}
          size="xl"
        >
          {#if authState.isLoading}
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
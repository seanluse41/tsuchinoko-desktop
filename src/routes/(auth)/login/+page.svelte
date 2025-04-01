<!-- src/routes/(auth)/login/+page.svelte -->
<script>
  import { open } from "@tauri-apps/plugin-shell";
  import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
  import { Card, Heading, P, Img, Button, Spinner } from "svelte-5-ui-lib";
  import { buildAuthUrl } from "$lib/kintone/kintoneAuthRequest";
  import { authState } from "$lib/app/appLoginManager.svelte.js";
  import { trackNavigation } from "$lib/app/appNavigationTracker.svelte";
  let isButtonDisabled = $derived(
    authState.isLoading || !authState.user.subdomain,
  );
  let buttonText = $derived(
    authState.isLoading ? "Loading ..." : "Login with Kintone",
  );

  async function initiateKintoneLogin() {
    try {
      Object.assign(authState, {
        isLoading: true,
        error: null,
      });
      console.log("Auth state updated:", authState);

      const authUrl = buildAuthUrl(
        authState.user.subdomain,
        authState.user.clientId,
        authState.user.domain,
      );
      await open(authUrl.toString());
    } catch (err) {
      Object.assign(authState, {
        error: "Failed to open login page. Please try again.",
        isLoading: false,
      });
      console.log("Auth state updated:", authState);
    }
  }

  $effect(() => {
    console.log("authstate from login page");
    $inspect(authState);
  });
</script>

<main
  class="flex min-h-screen w-full items-center justify-center p-2 bg-amber-900"
>
  <Card class="max-w-none md:w-3/4 p-2 md:p-8 z-10">
    <div class="mb-8 flex justify-center">
      <Img
        src="logo_kintone_mark_rgb.png"
        alt="Kintone Logo"
        class="h-12 w-auto"
      />
    </div>
    <div class="flex flex-col items-center gap-8">
      <Heading tag="h1" class="mb-6 text-center text-slate-700">
        Tsuuchinoko
      </Heading>

      {#if authState.error}
        <div class="mb-4 w-full rounded-md bg-red-50 p-4">
          <div class="ml-3">
            <P class="text-sm font-medium text-red-800">{authState.error}</P>
          </div>
        </div>
      {/if}

      {#if !authState.user.subdomain}
        <div class="mb-4 w-full rounded-md bg-amber-50 p-4 px-8">
          <P class="text-sm font-medium text-center text-slate-700"
            >Please complete the First Time Setup to configure your Kintone
            subdomain.</P
          >
        </div>
      {/if}

      <div class="flex flex-col gap-4 w-full justify-center items-center">
        <Button
          class="w-full md:w-3/4 rounded-lg bg-amber p-6 text-slate-700 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-thistle focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onclick={initiateKintoneLogin}
          disabled={isButtonDisabled}
          size="xl"
        >
          {#if authState.isLoading}
            <Spinner class="me-3" size="8" color="teal" />
          {/if}
          <P class="text-xl">{buttonText}</P>
        </Button>

        <Button
          class="w-full md:w-3/4 rounded-lg bg-thistle p-6 text-slate-700 hover:bg-thistle-700 focus:outline-none focus:ring-2 focus:ring-amber focus:ring-offset-2"
          href="/setup"
          size="xl"
          onclick={() => trackNavigation("/setup")}
        >
          <P class="text-xl">First Time Setup</P>
        </Button>
      </div>
    </div>
  </Card>
</main>

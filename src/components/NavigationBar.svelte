<script>
  import {
    Navbar,
    NavBrand,
    NavUl,
    NavLi,
    uiHelpers,
    Dropdown,
    DropdownUl,
    DropdownLi,
  } from "svelte-5-ui-lib";
  import { page } from "$app/state";
  let activeUrl = $state(page.url.pathname);
  import { ChevronDownOutline } from "flowbite-svelte-icons";
  import { trackNavigation } from "$lib/app/appNavigationTracker.svelte";
  import { preferencesState } from "$lib/app/appPreferences.svelte";
  
  let nav = uiHelpers();
  let navStatus = $state(false);
  let toggleNav = nav.toggle;
  let closeNav = nav.close;
  
  let dropdown = uiHelpers();
  let dropdownStatus = $state(false);
  let closeDropdown = dropdown.close;
  
  $effect(() => {
    navStatus = nav.isOpen;
    dropdownStatus = dropdown.isOpen;
    activeUrl = page.url.pathname;
  });

  const trackNav = async (path) => {
    trackNavigation(path);
    closeDropdown();
  }
</script>

<Navbar
  {toggleNav}
  {closeNav}
  {navStatus}
  breakPoint="md"
  navClass="border-b-2 border-ebony sticky z-50"
  style="background-color: {preferencesState.menuColor || '#D1C1E9'}"
>
  {#snippet brand()}
    <NavBrand siteName="Tsuuchinoko" class="text-ebony-800"></NavBrand>
  {/snippet}

  <NavUl {activeUrl} class="text-ebony-800">
    <NavLi href="/home" onclick={() => trackNav('/home')} class="hover:text-moss_green-600">Home</NavLi>
    <NavLi href="/task-create" onclick={() => trackNav('/task-create')} class="hover:text-moss_green-600"
      >Task Creator</NavLi
    >
    <NavLi
      onclick={dropdown.toggle}
      class="cursor-pointer hover:text-moss_green-600"
    >
      Settings<ChevronDownOutline class="ms-2 inline h-6 w-6 text-ebony" />
    </NavLi>
    <div class="relative">
      <Dropdown
        {dropdownStatus}
        {closeDropdown}
        class="absolute -top-[20px] left-[100px] md:-left-[170px] md:top-[20px] bg-thistle"
      >
        <DropdownUl>
          <DropdownLi
            href="/account"
            onclick={() => trackNav('/account')}
            class="hover:bg-thistle-700 text-ebony-800">Account</DropdownLi
          >
          <DropdownLi
            href="/preferences"
            onclick={() => trackNav('/preferences')}
            class="hover:bg-thistle-700 text-ebony-800">Preferences</DropdownLi
          >
          <DropdownLi
            href="/about"
            onclick={() => trackNav('/about')}
            class="hover:bg-thistle-700 text-ebony-800">About</DropdownLi
          >
          <DropdownLi
            href="/logout"
            onclick={() => trackNav('/logout')}
            class="hover:bg-thistle-700 text-ebony-800">Logout</DropdownLi
          >
        </DropdownUl>
      </Dropdown>
    </div>
  </NavUl>
</Navbar>
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { createDialog, melt } from "@melt-ui/svelte";
  // @ts-ignore
  import CryptoJS from "crypto-js";

  import { createDownloadUrl } from "$lib/utils/create-download-url";

  const {
    elements: { trigger, portalled, overlay, content, close, title },
    states: { open },
  } = createDialog();

  let apiKey = "";
  let prompt = "";
  let loading = false;
  let imgSrc = "";
  let imageRendered = false;
  let placeholderText = "";
  let style = "vivid";
  let downloadUrl = "";
  let apiKeyInputOpen = false;

  onMount(async () => {
    const res = await fetch("/api/encryption-key");
    const encryptionKey = await res.text();
    const encryptedMessage = localStorage.getItem("encryptedMessage");

    if (encryptedMessage && encryptionKey) {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey);
      const decryptedMessage = bytes.toString(CryptoJS.enc.Utf8);

      if (decryptedMessage) {
        apiKey = decryptedMessage;
      }
    }

    placeholderText =
      placeholderPrompts[Math.floor(Math.random() * placeholderPrompts.length)];
  });

  async function setApiKey() {
    const res = await fetch("/api/encryption-key");
    const encryptionKey = await res.text();
    const encryptedMessage = CryptoJS.AES.encrypt(
      apiKey,
      encryptionKey
    ).toString();
    localStorage.setItem("encryptedMessage", encryptedMessage);
    open.set(false);
  }

  async function generateImage() {
    if (!apiKey) {
      apiKeyInputOpen = true;
      open.set(true);
      return;
    }

    if (!prompt) {
      return;
    }

    loading = true;
    const res = await fetch("/api/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, key: apiKey, style }),
    });

    if (res.ok) {
      const data = await res.json();
      prompt = "";
      imgSrc = `data:image/jpeg;base64,${data[0].b64_json}`;
      const base64 = data[0].b64_json;
      downloadUrl = createDownloadUrl(base64, "image/jpeg");
    } else {
      loading = false;
      alert("Something went wrong");
    }
  }

  function handleLoad() {
    loading = false;
    imageRendered = true;
  }

  function reset() {
    imageRendered = false;
    imgSrc = "";
  }

  const placeholderPrompts = [
    "a cartoon of stockholm at night",
    "a dog taking it's owner for a walk",
    "a piece of fruit getting revenge on a smoothie maker",
    "the place where no cars go",
    "a city made of glass",
    "a viking telling a joke to a donkey",
    "a horrified biscuit dipping itself in tea",
  ];
</script>

<div class="min-h-screen min-w-screen flex justify-center screen relative px-4">
  <button
    use:melt={$trigger}
    class="absolute bottom-4 right-4 px-4 py-2 shadow-xl rounded-lg bg-neutral-50"
    >Settings</button
  >

  <div class="flex flex-col items-center w-[512px] mt-11">
    <h1 class="text-5xl">DALL-E THREE</h1>
    <form
      class="flex h-fit w-full flex-row items-center rounded-xl bg-black px-1 shadow-lg mt-6 mb-8"
      action=""
      enctype="multipart/form-data"
      on:submit={generateImage}
    >
      <input
        autocomplete="off"
        type="text"
        placeholder={placeholderText}
        class="h-10 w-full resize-none bg-transparent px-2 py-2.5 font-mono text-sm text-white outline-none ring-0 transition-all duration-300 placeholder:text-gray-400"
        bind:value={prompt}
      /><button
        type="submit"
        aria-disabled="false"
        class="flex aspect-square h-8 w-8 items-center justify-center rounded-lg text-white outline-0 ring-0 hover:bg-white/25 focus:bg-white/25"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="-ml-px"
          ><polyline points="9 10 4 15 9 20" /><path
            d="M20 4v7a4 4 0 0 1-4 4H4"
          /></svg
        ></button
      >
    </form>
    <div
      class="w-[512px] max-h-[512px] max-w-[90vw] aspect-square overflow-hidden rounded-md shadow-sm relative"
    >
      <div class={loading ? "skeleton-loader" : "hidden"} />
      {#if imgSrc}
        <img
          src={imgSrc}
          alt=""
          in:fade={{ duration: 200 }}
          on:load={handleLoad}
          class={loading ? "opacity-0" : "opacity-100"}
        />
      {/if}
      {#if !loading && !imageRendered}
        <img src="/mesh.jpg" alt="" />
      {/if}
    </div>

    {#if imageRendered}
      <div class="flex gap-4 mt-8 bg-black px-6 py-2 rounded-xl shadow-lg">
        <div
          class="hover:cursor-pointer"
          on:click={reset}
          on:keydown={reset}
          role="button"
          tabindex="0"
        >
          <img src="/arrow-path.svg" alt="" class=" w-5 h-5" />
        </div>
        <a href={downloadUrl} download="image.jpg">
          <img src="arrow-down-tray.svg" alt="" class="w-5 h-5" />
        </a>
      </div>
    {/if}
  </div>
</div>

<div use:melt={$portalled}>
  {#if $open}
    <div use:melt={$overlay} class="fixed inset-0 z-50 bg-black/50" />
    <div
      use:melt={$content}
      class="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[90vw]
    max-w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-neutral-50
    px-12 pt-12 pb-16 shadow-lg"
      in:fly={{ y: 100, duration: 200 }}
    >
      <h2 use:melt={$title} class="mb-2">Settings</h2>
      <div class="flex flex-col mb-2">
        <label for="style" class="text-sm text-neutral-500">Style</label>
        <select
          name="style"
          id=""
          bind:value={style}
          class="px-4 py-2 mt-1 bg-transparent border border-neutral-300 rounded-md shadow-inner focus:outline-none focus:ring focus:ring-sky-100 transition-all duration-300 ease-in-out"
        >
          <option value="vivid">Vivid</option>
          <option value="natural">Natural</option>
        </select>
      </div>
      <form action="" on:submit={setApiKey}>
        <div class="px-4 py-2 bg-neutral-200/50 rounded-lg mt-4">
          <div
            class="flex justify-between hover:cursor-pointer items-center"
            on:click={() => (apiKeyInputOpen = !apiKeyInputOpen)}
            on:keydown={() => (apiKeyInputOpen = !apiKeyInputOpen)}
            role="button"
            tabindex="0"
          >
            <label for="key" class="text-sm text-neutral-700"
              >Open AI API Key</label
            >

            <img
              src="/chevron-down.svg"
              alt=""
              class="{apiKeyInputOpen
                ? '-rotate-180'
                : ''} h-4 transition-all duration-200 ease-in"
            />
          </div>
          {#if apiKeyInputOpen}
            <div transition:slide>
              <input
                name="key"
                type="password"
                placeholder="Enter your OpenAI API key..."
                class="w-full px-4 py-2 mt-3 bg-transparent border border-neutral-500 rounded-md shadow-inner focus:outline-none focus:ring focus:ring-sky-100 transition-all duration-300 ease-in-out"
                bind:value={apiKey}
              />
              <button class="underline mt-2" type="submit">Submit</button>
            </div>
          {/if}
        </div>
      </form>
      <button use:melt={$close} class="top-4 right-4 absolute"
        ><svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 18L18 6M6 6L18 18"
            stroke="#000"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg></button
      >
    </div>
  {/if}
</div>

<style>
  .screen {
    background: url("/bg.png") no-repeat center center fixed;
    background-color: #f5f5f5;
  }

  .skeleton-loader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to right,
      #dcdcdc 0%,
      #c4c4c4 50%,
      #dcdcdc 100%
    );
    background-size: 200% auto;
    animation: skeleton 2.5s linear infinite;
  }

  select {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-image: url("chevron-down.svg");
    background-repeat: no-repeat;
    background-position: calc(100% - 1rem) center;
    background-size: 1em;
  }

  @keyframes skeleton {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>

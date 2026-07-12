<script lang="ts">
  import { auth } from "$lib/stores/auth.svelte";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  onMount(() => {
    if (!auth.isAuthed) return void goto("/login");
    if (auth.needsSetup) return void goto("/setup");
    if (auth.needsFy) return void goto("/fy");
  });

  type Section = "home" | "purchase" | "sale" | "payment" | "received" | "stock" | "reports";

  const nav: { key: Section; label: string; ready: boolean }[] = [
    { key: "home", label: "Home", ready: true },
    { key: "purchase", label: "Purchase", ready: false },
    { key: "sale", label: "Sale", ready: false },
    { key: "payment", label: "Payment", ready: false },
    { key: "received", label: "Received", ready: false },
    { key: "stock", label: "Stock", ready: false },
    { key: "reports", label: "Reports", ready: false },
  ];

  let section = $state<Section>("home");

  const fyLabel = $derived(
    auth.fy ? `FY ${auth.fy.start_date.slice(0, 4)}–${auth.fy.end_date.slice(0, 4)}` : ""
  );
  const activeLabel = $derived(nav.find((n) => n.key === section)?.label ?? "");

  async function doLogout() {
    await auth.logout();
    await goto("/login");
  }

  async function onCompanyChange(e: Event) {
    await auth.setCurrentCompany(Number((e.target as HTMLSelectElement).value));
  }
</script>

{#if auth.isAuthed && !auth.needsSetup && !auth.needsFy}
  <div class="shell">
    <aside class="rail">
      <div class="brand">Finora</div>
      <nav>
        {#each nav as item (item.key)}
          <button
            class="navitem"
            class:active={section === item.key}
            onclick={() => (section = item.key)}
          >
            <span>{item.label}</span>
            {#if !item.ready}<span class="soon">soon</span>{/if}
          </button>
        {/each}
      </nav>
    </aside>

    <div class="main">
      <header>
        <strong>{activeLabel}</strong>
        <div class="ctx">
          {#if auth.mode === "multi" && auth.companies.length > 1}
            <select value={auth.currentCompany?.id} onchange={onCompanyChange}>
              {#each auth.companies as c (c.id)}
                <option value={c.id}>{c.name}</option>
              {/each}
            </select>
          {:else}
            <span class="pill">{auth.currentCompany?.name ?? "—"}</span>
          {/if}
          <span class="pill fy">{fyLabel}</span>
          <span class="user">{auth.user?.username}</span>
          <button class="ghost" onclick={doLogout}>Logout</button>
        </div>
      </header>

      <section class="body">
        {#if section === "home"}
          <div class="grid">
            <div class="stat">
              <span class="k">Company</span>
              <span class="v">{auth.currentCompany?.name ?? "—"}</span>
            </div>
            <div class="stat">
              <span class="k">Mode</span>
              <span class="v cap">{auth.mode ?? "—"}</span>
            </div>
            <div class="stat">
              <span class="k">Financial year</span>
              <span class="v">{fyLabel || "—"}</span>
            </div>
            <div class="stat">
              <span class="k">Companies</span>
              <span class="v">{auth.companies.length}</span>
            </div>
          </div>
          <p class="hint">
            You're set up and the financial year is active. Pick a voucher type on
            the left to start entering transactions.
          </p>
        {:else}
          <div class="placeholder">
            <h2>{activeLabel}</h2>
            <p>This screen is arriving in the next build step.</p>
          </div>
        {/if}
      </section>
    </div>
  </div>
{/if}

<style>
  :global(body) { margin: 0; }
  .shell { display: grid; grid-template-columns: 210px 1fr; height: 100vh;
           background: #0f1115; color: #e6e8ec;
           font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif; }

  .rail { border-right: 1px solid #2a2f3a; padding: 14px 10px; display: flex;
          flex-direction: column; gap: 4px; }
  .brand { font-weight: 700; font-size: 18px; padding: 6px 10px 14px; }
  nav { display: flex; flex-direction: column; gap: 2px; }
  .navitem { display: flex; align-items: center; justify-content: space-between;
             padding: 9px 12px; border-radius: 8px; border: 1px solid transparent;
             background: transparent; color: #c7ccd6; font-size: 14px; cursor: pointer;
             text-align: left; }
  .navitem:hover { background: #171a21; }
  .navitem.active { background: #16233b; color: #fff; border-color: #24406e; }
  .soon { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: .04em; }

  .main { display: flex; flex-direction: column; min-width: 0; }
  header { display: flex; align-items: center; gap: 12px; padding: 12px 18px;
           border-bottom: 1px solid #2a2f3a; }
  header strong { font-size: 15px; }
  .ctx { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .pill { padding: 4px 10px; border-radius: 999px; background: #171a21;
          border: 1px solid #2a2f3a; font-size: 12px; color: #c7ccd6; }
  .pill.fy { background: #16233b; border-color: #24406e; color: #6ea8ff; font-weight: 600; }
  .user { color: #9aa0aa; font-size: 13px; }
  select { padding: 5px 8px; border-radius: 8px; border: 1px solid #2a2f3a;
           background: #0f1115; color: #e6e8ec; font-size: 13px; }
  button.ghost { padding: 6px 12px; border-radius: 8px; border: 1px solid #2a2f3a;
                 background: #171a21; color: #e6e8ec; cursor: pointer; font-size: 13px; }
  button.ghost:hover { border-color: #2f6feb; }

  .body { padding: 22px; overflow-y: auto; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 12px; max-width: 760px; }
  .stat { display: flex; flex-direction: column; gap: 6px; padding: 16px;
          background: #171a21; border: 1px solid #2a2f3a; border-radius: 12px; }
  .stat .k { font-size: 12px; color: #9aa0aa; }
  .stat .v { font-size: 18px; font-weight: 600; }
  .v.cap { text-transform: capitalize; }
  .hint { margin: 20px 0 0; color: #9aa0aa; font-size: 14px; max-width: 620px; line-height: 1.5; }

  .placeholder { display: grid; place-items: center; text-align: center;
                 padding: 60px 20px; color: #9aa0aa; }
  .placeholder h2 { margin: 0 0 6px; color: #e6e8ec; font-size: 20px; }
  .placeholder p { margin: 0; font-size: 14px; }
</style>

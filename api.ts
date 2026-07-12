async function submit(e: Event) {
    e.preventDefault();
    if (busy) return;
    if (!startDate || !endDate) return;
    if (new Date(endDate) <= new Date(startDate)) {
      error = "End date must be after the start date.";
      return;
    }
    busy = true;
    error = null;
    try {
      await auth.ensureFy(startDate, endDate);
      await goto("/app");
    } catch (err) {
      error =
        err instanceof ApiError ? err.message : "Could not create the financial year.";
      busy = false; // on success we navigate away, so only reset on failure
    }
  }

/**
   * Open the initial (active) financial year. Idempotent: if the server reports
   * one already exists (a duplicate submit, or a prior run created it), adopt the
   * existing active FY instead of failing. Only rethrows on a genuine failure.
   */
  async ensureFy(startDate: string, endDate: string) {
    try {
      fy = await request<FinancialYear>("/api/fy/", {
        method: "POST",
        body: JSON.stringify({ start_date: startDate, end_date: endDate }),
      });
    } catch (e) {
      const years = await request<FinancialYear[]>("/api/fy/");
      fy = years.find((y) => y.is_active && !y.is_closed) ?? null;
      if (!fy) throw e;
    }
    return fy;
  },

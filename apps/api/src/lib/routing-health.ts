export type RoutingHealth = {
  tenantHostname: string;
  dnsOk: boolean;
  httpOk: boolean;
  status: "live" | "dns_missing" | "unreachable" | "archived";
  checkedAt: string;
};

export async function checkRoutingHealth(input: {
  slug: string;
  suffix: string;
  archived?: boolean;
  timeoutMs?: number;
}): Promise<RoutingHealth> {
  const tenantHostname = `${input.slug}.${input.suffix}`;
  const checkedAt = new Date().toISOString();

  if (input.archived) {
    return {
      tenantHostname,
      dnsOk: false,
      httpOk: false,
      status: "archived",
      checkedAt,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.timeoutMs ?? 4_000);

  try {
    const res = await fetch(`https://${tenantHostname}/`, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: { "User-Agent": "kumooo-routing-health/1.0" },
    });
    // Any HTTP response means DNS + Worker route reached something.
    return {
      tenantHostname,
      dnsOk: true,
      httpOk: res.status > 0,
      status: "live",
      checkedAt,
    };
  } catch {
    return {
      tenantHostname,
      dnsOk: false,
      httpOk: false,
      status: "dns_missing",
      checkedAt,
    };
  } finally {
    clearTimeout(timer);
  }
}

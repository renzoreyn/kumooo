export type RoutingHealth = {
  tenantHostname: string;
  dnsOk: boolean;
  httpOk: boolean;
  status: "live" | "dns_missing" | "unreachable" | "archived";
  checkedAt: string;
};

async function publicDnsResolves(hostname: string): Promise<boolean> {
  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`;
    const res = await fetch(url, {
      headers: { Accept: "application/dns-json" },
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { Status?: number; Answer?: unknown[] };
    // Status 0 = NOERROR with answers; 3 = NXDOMAIN
    return data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return false;
  }
}

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

  const dnsOk = await publicDnsResolves(tenantHostname);
  if (!dnsOk) {
    return {
      tenantHostname,
      dnsOk: false,
      httpOk: false,
      status: "dns_missing",
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
    return {
      tenantHostname,
      dnsOk: true,
      httpOk: res.status > 0,
      status: res.status > 0 ? "live" : "unreachable",
      checkedAt,
    };
  } catch {
    return {
      tenantHostname,
      dnsOk: true,
      httpOk: false,
      status: "unreachable",
      checkedAt,
    };
  } finally {
    clearTimeout(timer);
  }
}

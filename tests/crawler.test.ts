import { describe, it, expect } from "vitest";
import { normalizeUrl, isBlockedIp } from "@/lib/crawler";

describe("normalizeUrl", () => {
  it("legger på https når skjema mangler", () => {
    expect(normalizeUrl("eksempel.no")).toBe("https://eksempel.no/");
  });

  it("trekker URL ut av en markdown-lenke", () => {
    expect(normalizeUrl("[min side](https://eksempel.no)")).toBe(
      "https://eksempel.no/",
    );
  });

  it("fjerner anførselstegn og etterfølgende skilletegn", () => {
    expect(normalizeUrl('"eksempel.no".')).toBe("https://eksempel.no/");
  });

  it("avviser tom og ugyldig input", () => {
    expect(normalizeUrl("")).toBeNull();
    expect(normalizeUrl("   ")).toBeNull();
  });
});

describe("isBlockedIp — SSRF-vern", () => {
  it("blokkerer loopback og private adresser", () => {
    expect(isBlockedIp("127.0.0.1")).toBe(true);
    expect(isBlockedIp("10.0.0.1")).toBe(true);
    expect(isBlockedIp("192.168.1.1")).toBe(true);
    expect(isBlockedIp("172.16.5.5")).toBe(true);
  });

  it("blokkerer sky-metadata og link-local", () => {
    expect(isBlockedIp("169.254.169.254")).toBe(true);
  });

  it("blokkerer IPv6 loopback og ugyldig input", () => {
    expect(isBlockedIp("::1")).toBe(true);
    expect(isBlockedIp("ikke-en-ip")).toBe(true);
  });

  it("tillater vanlige offentlige adresser", () => {
    expect(isBlockedIp("8.8.8.8")).toBe(false);
    expect(isBlockedIp("1.2.3.4")).toBe(false);
  });
});

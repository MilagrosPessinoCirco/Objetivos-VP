import DOMPurify from "dompurify";
import { escapeRegExp } from "@microsoft/sp-lodash-subset";

export default class Utils {
  public static getVersion() {
    let json = require("../../../config/package-solution.json");
    return json["solution"]["version"];
  }

  public static removeUndefined(item: { [x: string]: any }) {
    return Object.keys(item).reduce(
      (obj, key) =>
        item[key] === undefined ? obj : { ...obj, [key]: item[key] },
      {},
    );
  }

  public static indexOfItemInArray<T = any>(
    array: any[],
    searchTerm: unknown,
    property: keyof T,
  ) {
    for (let i = 0; i < array.length; i++) {
      if (array[i][property] === searchTerm) return i;
    }
    return -1;
  }

  public static reloadPageByUrlCurrent(url: string) {
    history.pushState({}, "", url);
    location.reload();
  }

  public static replaceAll(str: string, find: string, replace: string) {
    return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
  }

  private static isBannedScheme(input: string): boolean {
    const bannedSchemes = [
      /^javascript:/i,
      /^vbscript:/i,
      /^data:/i,
      /^file:/i,
      /^ftp:/i,
      /^about:/i,
    ];
    return bannedSchemes.some((rx) => rx.test(input));
  }

  private static isAllowedRelative(input: string): boolean {
    return (
      input.startsWith("/") ||
      input.startsWith("SitePages/") ||
      input.startsWith("_layouts/")
    );
  }

  private static isSuspicious(input: string, isRelative: boolean): boolean {
    const suspicious = isRelative
      ? /(onload|onerror|onclick|<script)/i
      : /(onload|onerror|onclick|<script|javascript:|vbscript:|data:)/i;
    return suspicious.test(input);
  }

  private static isTrustedDomain(host: string): boolean {
    const trustedDomains = [
      "sharepoint.com",
      "office.com",
      "microsoft.com",
      "powerbi.com",
      "outlook.com",
      "onedrive.com",
    ];
    return trustedDomains.some(
      (d) => host === d || host.endsWith("." + d),
    );
  }

  private static cleanInput(raw: string): string {
    // Elimina caracteres de control ASCII (0x00-0x1F y 0x7F) sin regex de control chars
    return raw
      .trim()
      .split('')
      .filter(c => (c.charCodeAt(0) >= 32 && c.charCodeAt(0) !== 127))
      .join('')
      .replace(/%3Cscript/gi, "")
      .replace(/\\x3Cscript/gi, "");
  }

  private static isRelativeUrl(input: string): boolean {
    return !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(input) && !input.startsWith("//");
  }

  private static hasPathTraversal(input: string): boolean {
    return /\.\./.test(input) || /%2e%2e/i.test(input);
  }

  private static isValidPort(port: string): boolean {
    return !port || ["80", "443"].includes(port);
  }

  private static validateRelativeUrl(input: string): string {
    if (this.hasPathTraversal(input)) {
      console.warn("[Security] URL validation failed: Path traversal");
      return "";
    }
    if (!this.isAllowedRelative(input)) {
      console.warn("[Security] URL validation failed: Disallowed relative path");
      return "";
    }
    if (this.isSuspicious(input, true)) {
      console.warn("[Security] URL validation failed: Suspicious pattern in relative path");
      return "";
    }
    return input;
  }

  private static validateAbsoluteUrl(input: string): string {
    let urlObj: URL;
    try {
      urlObj = new URL(input);
    } catch {
      console.warn("[Security] URL validation failed: Malformed absolute URL");
      return "";
    }

    if (!["https:", "http:"].includes(urlObj.protocol)) {
      console.warn("[Security] URL validation failed: Disallowed protocol");
      return "";
    }

    const host = urlObj.hostname.toLowerCase();
    if (!this.isTrustedDomain(host)) {
      console.warn("[Security] URL validation failed: Untrusted domain");
      return "";
    }

    if (!this.isValidPort(urlObj.port)) {
      console.warn("[Security] URL validation failed: Disallowed port");
      return "";
    }

    if (this.hasPathTraversal(urlObj.pathname)) {
      console.warn("[Security] URL validation failed: Path traversal");
      return "";
    }

    const finalStr = urlObj.toString();
    if (this.isSuspicious(finalStr, false)) {
      console.warn("[Security] URL validation failed: Suspicious pattern");
      return "";
    }

    return finalStr;
  }

  public static validateAndSanitizeUrl(raw: string): string {
    if (typeof raw !== "string") {
      console.warn("[Security] URL validation failed: Invalid input type");
      return "";
    }

    let input = this.cleanInput(raw);
    if (input.length === 0 || input.length > 2048) {
      console.warn("[Security] URL validation failed: Empty or too long");
      return "";
    }

    if (this.isBannedScheme(input)) {
      console.warn("[Security] URL validation failed: Banned scheme");
      return "";
    }

    if (this.isRelativeUrl(input)) {
      return this.validateRelativeUrl(input);
    }

    return this.validateAbsoluteUrl(input);
  }

  private static sanitizeUrlForNavigation(url: string): string | null {
    const validatedUrl = Utils.validateAndSanitizeUrl(url);
    if (!validatedUrl) {
      console.error("[Security] URL validation failed");
      return null;
    }

    const sanitized = DOMPurify.sanitize(validatedUrl, {
      ALLOWED_URI_REGEXP: /^(?:(?:https?):\/\/|\/(?!\/)[^/].*|\/)$|^(?:SitePages\/|_layouts\/).*/i,
    });

    if (!sanitized) {
      console.error("[Security] DOMPurify sanitization failed");
      return null;
    }

    return sanitized;
  }

  public static openInSelfTab(url: string): void {
    const sanitized = Utils.sanitizeUrlForNavigation(url);
    if (!sanitized) {
      console.error("[Security] openInSelfTab failed: URL sanitization failed");
      return;
    }

    try {
      window.location.assign(sanitized);
    } catch (error) {
      console.error("[Security] Error navigating to URL:", error);
    }
  }

  public static openInNewTab(url: string): void {
    const sanitized = Utils.sanitizeUrlForNavigation(url);
    if (!sanitized) {
      console.error("[Security] openInNewTab failed: URL sanitization failed");
      return;
    }

    try {
      const a = document.createElement('a');
      a.href = sanitized;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    } catch (error) {
      console.error("[Security] Error opening URL:", error);
    }
  }
}

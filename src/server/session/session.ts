import { Page, Route, Request, Frame } from "playwright";
import { JSDOM } from "jsdom";
import { isSameDomain } from "../../utils";

const IFRAME_NAME = "aut-frame";
const DEFAULT_APP_URL = "https://www.playwright.dev/";

export class Session {
  private _id: string;
  private code: string = "";
  private appUrl: string = "";

  constructor(private page: Page, private injectedDOM: string, private serverUrl: string) {
    this._id = crypto.randomUUID();
  }

  setCode(code: string) {
    this.code = code;
  }

  getCode() {
    return this.code;
  }

  get id() {
    return this._id;
  }

  private get frame() {
    return this.page.frame(IFRAME_NAME);
  }

  public async init() {
    this.page.addInitScript(``);
    this.page.route("**/*", this.onRequestMade.bind(this));

    await this.loadApplication();
  }

  async loadApplication(appUrl?: string) {
    this.appUrl = appUrl || DEFAULT_APP_URL;
    /**
     * If the frame is already loaded, we can use it to load the application
     * else, this is the first time we are loading the application
     */
    if (appUrl && this.frame) {
      try {
        await this.frame.goto(appUrl);
      } catch (err) {
        await this.page.goto(new URL(appUrl).origin, { waitUntil: "networkidle" });
        await this.page.waitForSelector(`iframe[name='${IFRAME_NAME}']`);
      }
    } else {
      await this.page.goto(this.serverUrl);
    }
  }

  private patchDOM(html: string, appUrl: string) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = `
      window.APP_URL = "${appUrl}";
      window.SESSION_ID = "${this.id}";
      window.SERVER_URL = "${this.serverUrl}";
    `;
    document.head.appendChild(script);
    return dom.serialize();
  }

  private async onRequestMade(route: Route, request: Request) {
    const isMainFrame = request.frame() === this.page.mainFrame();
    if (isMainFrame && request.resourceType() === "document") {
      await route.fulfill({
        body: this.patchDOM(this.injectedDOM, this.appUrl),
        headers: {
          "Content-Type": "text/html",
        },
        status: 200,
      });
    } else if (
      isMainFrame &&
      !isSameDomain(request.url(), this.serverUrl) &&
      request.url().includes("assets")
    ) {
      try {
        const originalUrl = new URL(request.url());
        const serverOrigin = new URL(this.serverUrl).origin;
        const newUrl = serverOrigin + originalUrl.pathname + originalUrl.search + originalUrl.hash;
        const response = await fetch(newUrl);
        const body = Buffer.from(await response.arrayBuffer());
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });
        await route.fulfill({
          status: response.status,
          headers,
          body,
        });
      } catch (err) {
        return await route.continue();
      }
    } else {
      return await route.continue();
    }
  }
}

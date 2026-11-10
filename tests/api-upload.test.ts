import { afterEach, expect, it, vi } from "vitest";
import { request } from "../src/app/lib/api";
afterEach(() => vi.unstubAllGlobals());
it("uploads real multipart data with browser boundary and cookie credentials", async () => {
  vi.stubGlobal("fetch",vi.fn(async (url, init) => {
    const wire = new Request(new URL(url,"http://localhost"),init);
    expect(wire.headers.get("content-type")).toMatch(/^multipart\/form-data; boundary=/);
    expect(wire.headers.get("authorization")).toBe("Bearer fixture");
    expect(init.credentials).toBe("include");
    const form = await wire.formData();
    expect(await (form.get("document") as File).text()).toBe("test document");
    return Response.json({ok:true});
  }));
  const body = new FormData(); body.append("document",new Blob(["test document"]),"fixture.txt");
  await expect(request("/api/verification/upload",{method:"POST",body,headers:new Headers({Authorization:"Bearer fixture","Content-Type":"application/json"})})).resolves.toEqual({ok:true});
});
it("still sends JSON correctly for ordinary API requests", async () => {
  vi.stubGlobal("fetch",vi.fn(async (_url, init) => {
    expect(init.headers.get("Content-Type")).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({value:1});
    return Response.json({ok:true});
  }));
  await request("/fixture",{method:"POST",body:JSON.stringify({value:1})});
});

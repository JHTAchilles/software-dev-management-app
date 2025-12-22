import { fetchWithAuth } from "@/lib/apiClient";

describe("fetchWithAuth", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("adds Authorization header when token exists", async () => {
    localStorage.setItem("access_token", "test-token");

    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 200 }));

    await fetchWithAuth("http://example.test/resource");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const call = fetchSpy.mock.calls[0];
    const init = call && call[1];
    const headers = init?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("clears token and redirects to /login on 401", async () => {
    localStorage.setItem("access_token", "expired-token");

    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 401 }));

    await expect(fetchWithAuth("http://example.test/secure")).rejects.toThrow(
      /session expired/i,
    );

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(window.location.href).toBe("/login");
  });
});

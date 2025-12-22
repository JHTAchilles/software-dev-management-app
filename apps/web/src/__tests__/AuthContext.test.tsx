import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

function LoginHarness() {
  const { login, user, isAuthenticated } = useAuth();

  return (
    <div>
      <div data-testid="auth-state">
        {isAuthenticated ? `yes:${user?.username}` : "no"}
      </div>
      <button
        onClick={() => login({ username: "alice", password: "pw" })}
        type="button"
      >
        Login
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    pushMock.mockClear();
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("stores token, loads user, and navigates to /dashboard on login", async () => {
    const user = userEvent.setup();

    const fetchSpy = jest.spyOn(globalThis, "fetch");
    fetchSpy
      // POST /auth/login
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ access_token: "t123", token_type: "bearer" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      )
      // GET /auth/me
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ id: "u1", username: "alice", email: "a@b.c" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
      );

    render(
      <AuthProvider>
        <LoginHarness />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Login" }));

    await waitFor(() => {
      expect(localStorage.getItem("access_token")).toBe("t123");
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
      expect(screen.getByTestId("auth-state")).toHaveTextContent("yes:alice");
    });
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";

import ProtectedRoute from "@/components/ProtectedRoute";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const useAuthMock = jest.fn();

jest.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    pushMock.mockClear();
    useAuthMock.mockReset();
  });

  it("renders a loading state while auth is loading", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      loading: true,
    });

    render(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("redirects to /login when not authenticated", async () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>,
    );

    // useEffect runs after render
    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      loading: false,
    });

    render(
      <ProtectedRoute>
        <div>Secret</div>
      </ProtectedRoute>,
    );

    expect(screen.getByText("Secret")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});

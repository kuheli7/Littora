import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock supabase ──────────────────────────────────────────────────────────
// IMPORTANT: vi.mock factory is hoisted — cannot reference outer variables.
// Use vi.fn() directly inside the factory; grab references after import.
vi.mock("../../lib/supabase.js", () => ({
  supabase: {
    auth: {
      getSession:         vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange:  vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signUp:             vi.fn(),
      signOut:            vi.fn(),
    },
  },
}));

vi.mock("../../assets/logo.png",         () => ({ default: "logo.png" }));
vi.mock("../../assets/navbar_image.png", () => ({ default: "navbar.png" }));

import { supabase } from "../../lib/supabase.js";
import { AuthProvider, useAuth } from "../../context/AuthContext.jsx";

// Convenience references to the mocked fns
const mockGetSession        = vi.mocked(supabase.auth.getSession);
const mockOnAuthStateChange = vi.mocked(supabase.auth.onAuthStateChange);
const mockSignIn            = vi.mocked(supabase.auth.signInWithPassword);
const mockSignUp            = vi.mocked(supabase.auth.signUp);
const mockSignOut           = vi.mocked(supabase.auth.signOut);

// Helper component that exposes context values
function AuthDisplay() {
  const { user, loading, isAdmin, getToken } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user?.email ?? "none"}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <AuthDisplay />
    </AuthProvider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
describe("AuthContext — initial loading", () => {
  beforeEach(() => {
    mockGetSession.mockReset();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("starts in loading state then resolves to no user when session is null", async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } });

    renderAuth();
    // Initially loading
    expect(screen.getByTestId("loading").textContent).toBe("true");

    await act(async () => {});
    expect(screen.getByTestId("loading").textContent).toBe("false");
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("restores user from an existing session", async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: "u1", email: "user@test.com" } } },
    });

    renderAuth();
    await act(async () => {});

    expect(screen.getByTestId("user").textContent).toBe("user@test.com");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("AuthContext — isAdmin flag", () => {
  beforeEach(() => {
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("isAdmin is false when user email does not match VITE_ADMIN_EMAIL", async () => {
    mockGetSession.mockResolvedValueOnce({
      data: { session: { user: { id: "u1", email: "regular@test.com" } } },
    });
    renderAuth();
    await act(async () => {});
    expect(screen.getByTestId("isAdmin").textContent).toBe("false");
  });

  it("isAdmin is false when no user is logged in", async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session: null } });
    renderAuth();
    await act(async () => {});
    expect(screen.getByTestId("isAdmin").textContent).toBe("false");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("AuthContext — signUp", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("throws when supabase.auth.signUp returns an error", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: null,
      error: { message: "Email taken", code: "dup" },
    });

    let capturedSignUp;
    function SignUpCaller() {
      const { signUp } = useAuth();
      capturedSignUp = signUp;
      return null;
    }

    render(<AuthProvider><SignUpCaller /></AuthProvider>);
    await act(async () => {});

    await expect(capturedSignUp("a@b.com", "pass123")).rejects.toMatchObject({
      message: "Email taken",
    });
  });

  it("throws a custom error when identities is empty (duplicate email)", async () => {
    mockSignUp.mockResolvedValueOnce({
      data: { user: { id: "x", identities: [] } },
      error: null,
    });

    let capturedSignUp;
    function SignUpCaller() {
      const { signUp } = useAuth();
      capturedSignUp = signUp;
      return null;
    }

    render(<AuthProvider><SignUpCaller /></AuthProvider>);
    await act(async () => {});

    await expect(capturedSignUp("dup@b.com", "pass123")).rejects.toThrow(
      /already registered/i
    );
  });

  it("resolves with data on successful sign up", async () => {
    const fakeData = { user: { id: "new", identities: [{ id: "i" }] } };
    mockSignUp.mockResolvedValueOnce({ data: fakeData, error: null });

    let capturedSignUp;
    function SignUpCaller() {
      const { signUp } = useAuth();
      capturedSignUp = signUp;
      return null;
    }

    render(<AuthProvider><SignUpCaller /></AuthProvider>);
    await act(async () => {});

    const result = await capturedSignUp("ok@b.com", "pass123", "Jane");
    expect(result).toEqual(fakeData);
    expect(mockSignUp).toHaveBeenCalledWith({
      email:    "ok@b.com",
      password: "pass123",
      options:  { data: { full_name: "Jane" } },
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("AuthContext — login", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it("throws when supabase.auth.signInWithPassword returns an error", async () => {
    mockSignIn.mockResolvedValueOnce({
      data: null,
      error: { message: "Invalid credentials" },
    });

    let capturedLogin;
    function LoginCaller() {
      const { login } = useAuth();
      capturedLogin = login;
      return null;
    }

    render(<AuthProvider><LoginCaller /></AuthProvider>);
    await act(async () => {});

    await expect(capturedLogin("u@b.com", "bad")).rejects.toThrow("Invalid credentials");
  });

  it("resolves with data on successful login", async () => {
    const fakeData = { session: { access_token: "tok" } };
    mockSignIn.mockResolvedValueOnce({ data: fakeData, error: null });

    let capturedLogin;
    function LoginCaller() {
      const { login } = useAuth();
      capturedLogin = login;
      return null;
    }

    render(<AuthProvider><LoginCaller /></AuthProvider>);
    await act(async () => {});

    const result = await capturedLogin("u@b.com", "pass123");
    expect(result).toEqual(fakeData);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("AuthContext — logout", () => {
  it("calls supabase.auth.signOut", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSignOut.mockResolvedValueOnce({});

    let capturedLogout;
    function LogoutCaller() {
      const { logout } = useAuth();
      capturedLogout = logout;
      return null;
    }

    render(<AuthProvider><LogoutCaller /></AuthProvider>);
    await act(async () => {});
    await capturedLogout();

    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("AuthContext — getToken", () => {
  it("returns null when no session exists", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    let capturedGetToken;
    function TokenCaller() {
      const { getToken } = useAuth();
      capturedGetToken = getToken;
      return null;
    }

    render(<AuthProvider><TokenCaller /></AuthProvider>);
    await act(async () => {});

    const token = await capturedGetToken();
    expect(token).toBeNull();
  });

  it("returns the access token when a session exists", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "my-jwt", user: { id: "1" } } },
    });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    let capturedGetToken;
    function TokenCaller() {
      const { getToken } = useAuth();
      capturedGetToken = getToken;
      return null;
    }

    render(<AuthProvider><TokenCaller /></AuthProvider>);
    await act(async () => {});

    const token = await capturedGetToken();
    expect(token).toBe("my-jwt");
  });
});

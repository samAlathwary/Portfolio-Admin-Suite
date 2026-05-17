import React, { useEffect, useRef, useState } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useAuth, useClerk } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { setAuthTokenGetter, setBaseUrl, useGetAdminMe, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import NotFound from "@/pages/not-found";

import DashboardPage from "@/pages/dashboard";
import PartnersPage from "@/pages/partners";
import ServicesPage from "@/pages/services";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const apiBaseUrl =
  typeof import.meta.env.VITE_API_BASE_URL === "string"
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")
    : "";
const basePath =
  typeof import.meta.env.BASE_URL === "string"
    ? import.meta.env.BASE_URL.replace(/\/$/, "")
    : "";
const signInPath = `${basePath}/sign-in`;
const signUpPath = `${basePath}/sign-up`;

setBaseUrl(apiBaseUrl || null);

function normalizeClerkPath(path: unknown): string {
  if (typeof path !== "string" || path.length === 0) {
    return "/";
  }

  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(16, 68%, 52%)", // #D85E31
    colorForeground: "hsl(223, 48%, 11%)", // #0F172B
    colorMutedForeground: "hsl(215, 16%, 47%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorBackground: "hsl(0, 0%, 100%)",
    colorInput: "hsl(214, 32%, 91%)",
    colorInputForeground: "hsl(223, 48%, 11%)",
    colorNeutral: "hsl(214, 32%, 91%)",
    fontFamily: "'Inter', sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-foreground font-display font-semibold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary font-medium hover:text-accent",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary hover:text-accent",
    formFieldSuccessText: "text-green-600",
    alertText: "text-destructive",
    logoBox: "flex justify-center mb-4",
    logoImage: "h-10 object-contain",
    socialButtonsBlockButton: "border-input hover:bg-secondary",
    formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
    formFieldInput: "bg-background border-input text-foreground placeholder:text-muted-foreground",
    footerAction: "bg-transparent",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border-destructive text-destructive",
    otpCodeFieldInput: "border-input text-foreground",
    formFieldRow: "mb-4",
    main: "w-full",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-secondary px-4">
      <SignIn routing="path" path={signInPath} signUpUrl={signUpPath} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-secondary px-4">
      <SignUp routing="path" path={signUpPath} signInUrl={signInPath} />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { isSignedIn } = useAuth();
  const adminMeQuery = useGetAdminMe({
    query: {
      queryKey: getGetAdminMeQueryKey(),
      enabled: Boolean(isSignedIn),
      retry: false,
      staleTime: 60_000,
    },
  });

  if (!isSignedIn) {
    return <Redirect to="/" />;
  }

  if (adminMeQuery.isLoading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-secondary px-4">
        <p className="text-sm text-muted-foreground">Checking admin access...</p>
      </div>
    );
  }

  if (adminMeQuery.data?.isAdmin) {
    return <Component />;
  }

  return <AccessDeniedPage />;
}

function AccessDeniedPage() {
  const clerk = useClerk();

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-foreground">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account is signed in with Clerk, but its email is not allowlisted in
          <code className="mx-1 rounded bg-secondary px-1.5 py-0.5 text-xs">ADMIN_EMAILS</code>.
        </p>
        <Button
          className="mt-6"
          onClick={async () => {
            await clerk.signOut();
            window.location.assign(signInPath);
          }}
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}

function ClerkAuthBridge({ children }: { children: React.ReactNode }) {
  const { isLoaded, getToken, userId } = useAuth();
  const queryClient = useQueryClient();
  const [authReady, setAuthReady] = useState(false);
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) {
      setAuthReady(false);
      return;
    }

    setAuthTokenGetter(async () => {
      try {
        return (await getToken()) ?? null;
      } catch {
        return null;
      }
    });
    setAuthReady(true);

    return () => {
      setAuthTokenGetter(null);
      setAuthReady(false);
    };
  }, [getToken, isLoaded]);

  useEffect(() => {
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
      queryClient.clear();
    }

    prevUserIdRef.current = userId ?? null;
  }, [queryClient, userId]);

  if (!isLoaded || !authReady) {
    return null;
  }

  return <>{children}</>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      appearance={clerkAppearance}
      signInUrl={signInPath}
      signUpUrl={signUpPath}
      routerPush={(to) => setLocation(normalizeClerkPath(to))}
      routerReplace={(to) => setLocation(normalizeClerkPath(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkAuthBridge>
          <Switch>
            <Route path="/" component={HomeRedirect} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/dashboard">
              {() => <ProtectedRoute component={DashboardPage} />}
            </Route>
            <Route path="/partners">
              {() => <ProtectedRoute component={PartnersPage} />}
            </Route>
            <Route path="/services">
              {() => <ProtectedRoute component={ServicesPage} />}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </ClerkAuthBridge>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath || undefined}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;

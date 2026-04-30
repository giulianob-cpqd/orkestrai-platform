import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") {
      throw redirect({ to: "/login" });
    }
    const authed = !!window.localStorage.getItem("inspire.auth.user");
    throw redirect({ to: authed ? "/dashboard" : "/login" });
  },
  component: () => null,
});

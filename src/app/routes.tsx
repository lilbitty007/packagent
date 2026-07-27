import { createBrowserRouter } from "react-router";
import { Layout } from "./Layout"; // force reload
import { StartPackingView } from "./views/StartPackingView";
import { HistoryView } from "./views/HistoryView";
import { RulesConfigView } from "./views/RulesConfigView";
import { SystemAdminView } from "./views/SystemAdminView";
import { LoginView } from "./views/LoginView";
import { AcceptInviteView } from "./views/AcceptInviteView";
import { AccountSettingsView } from "./views/AccountSettingsView";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginView
  },
  {
    path: "/invite/:token",
    Component: AcceptInviteView
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: StartPackingView },
      { path: "history", Component: HistoryView },
      { path: "config", Component: RulesConfigView },
      { path: "system", Component: SystemAdminView },
      { path: "account", Component: AccountSettingsView }
    ]
  }
]);
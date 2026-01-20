import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import DebugPage from "@/pages/gate/debug";
import InboxPage from "@/pages/gate/inbox";
import ProposalDetailsPage from "@/pages/gate/proposal-details";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/gate/inbox" />
      </Route>
      <Route path="/gate/inbox" component={InboxPage} />
      <Route path="/gate/debug" component={DebugPage} />
      <Route path="/gate/proposals/:proposalId">
        {(params) => <ProposalDetailsPage params={params} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

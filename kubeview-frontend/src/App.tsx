import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import Callback from "./components/callback";
import { RepositoryDashboard } from "./components/repository-dashboard";
import { RepositoryDetail } from "./components/repository-detail";
import { PullRequestDetail } from "./components/pull-request/pull-request-detail";
import "./App.css";
import { AuthProvider, useAuth } from "./components/context/authProvider";

const queryClient = new QueryClient();

// const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const { isAuthenticated } = useAuth(); // Now it will work correctly
//   console.log("isAuthenticated", isAuthenticated);

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<Callback />} />
        </Routes>
        <AuthProvider>
          <Routes>
            <Route
              path="/dashboard"
              element={
                // <PrivateRoute>
                <RepositoryDashboard />
                // </PrivateRoute>
              }
            />
            <Route
              path="/repos/:owner/:name"
              element={
                // <PrivateRoute>
                <RepositoryDetail />
                // </PrivateRoute>
              }
            />
            <Route
              path="/repos/:owner/:name/pull/:number"
              element={
                // <PrivateRoute>
                <PullRequestDetail />
                // </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

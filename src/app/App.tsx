import { RouterProvider } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { DataModeProvider } from "./components/DataModeToggle";

export default function App() {
  return (
    <AuthProvider>
      <DataModeProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </DataModeProvider>
    </AuthProvider>
  );
}
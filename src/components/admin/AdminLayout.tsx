import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { ReactNode } from "react";
import logoAf from "@/assets/logo-af.png";

interface AdminLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

export function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="flex items-center gap-3">
          <img src={logoAf} alt="AF Brindes" className="w-8 h-8 object-contain" />
          <h1 className="font-bold text-lg">Painel Admin</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </header>
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}

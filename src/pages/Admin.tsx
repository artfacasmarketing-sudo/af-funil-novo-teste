import { useState } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductList } from "@/components/admin/ProductList";

export default function Admin() {
  const [password, setPassword] = useState<string | null>(null);

  const handleLogout = () => {
    setPassword(null);
  };

  if (!password) {
    return <AdminLogin onSuccess={setPassword} />;
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <ProductList password={password} />
    </AdminLayout>
  );
}

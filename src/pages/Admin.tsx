import { useState, useEffect } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProductList } from "@/components/admin/ProductList";

export default function Admin() {
  const [password, setPassword] = useState<string | null>(() =>
    sessionStorage.getItem("admin_pw")
  );

  useEffect(() => {
    if (password) sessionStorage.setItem("admin_pw", password);
  }, [password]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_pw");
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

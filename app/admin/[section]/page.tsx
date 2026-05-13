import AdminDashboard from "@/components/AdminDashboard";
import { notFound } from "next/navigation";

export default function AdminSectionPage({ params }: { params: { section: string } }) {
  const section = (params.section ?? "").toLowerCase();
  const allowed = new Set(["dashboard", "users", "categories", "data", "private", "home", "system"]);
  if (!allowed.has(section)) notFound();
  return <AdminDashboard />;
}

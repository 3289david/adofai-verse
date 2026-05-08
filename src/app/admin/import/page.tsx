import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ImportUI } from "./ImportUI";

export const metadata = { title: "Data Import — Admin" };

export default async function AdminImportPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");
  return <ImportUI />;
}

import { redirect } from "next/navigation";

type AdminPropertyPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminPropertyPage({
  params,
}: AdminPropertyPageProps) {
  await params;

  redirect("/admin/properties");
}
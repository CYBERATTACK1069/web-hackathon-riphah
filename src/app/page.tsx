import { getDatabase } from "@/lib/store";
import { PlatformDashboard } from "@/components/PlatformDashboard";

// Ensure dynamic rendering so updates from disk and API routes take effect immediately
export const dynamic = "force-dynamic";

export default async function Page() {
  const initialData = await getDatabase();

  return <PlatformDashboard initialData={initialData} />;
}


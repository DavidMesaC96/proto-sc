import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import NewCaseForm from "./NewCaseForm";

const VALID_CATEGORIES = ["INCIDENT", "REQUEST", "CHANGE"];
const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default async function NewCasePage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; category?: string; priority?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  const params = await searchParams;

  const initial = {
    title:    params.title ?? "",
    category: VALID_CATEGORIES.includes(params.category ?? "") ? (params.category ?? "INCIDENT") : "INCIDENT",
    priority: VALID_PRIORITIES.includes(params.priority ?? "") ? (params.priority ?? "MEDIUM")   : "MEDIUM",
  };

  return <NewCaseForm initial={initial} />;
}

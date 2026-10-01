import { createFileRoute } from "@tanstack/react-router";
import { DraftLeague } from "@/components/draft-league";

export const Route = createFileRoute("/")({ component: DraftLeague });

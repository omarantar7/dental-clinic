import { Text } from "@/components/ui/text";

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Text className="text-xs">{label}</Text>
      <span className="text-sm">{value || "—"}</span>
    </div>
  );
}

export { InfoRow };

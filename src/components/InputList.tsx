import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { List } from "lucide-react";

interface InputListProps {
  items: any[];
}

// Auto-suggest mic based on instrument type
const suggestMic = (instrumentType: string) => {
  const suggestions: Record<string, string> = {
    kick: "AKG D112",
    snare: "Shure SM57",
    tom: "Sennheiser MD 421",
    "vocal-mic": "Shure SM58",
    "electric-guitar": "Shure SM57",
    bass: "DI Box + SM57",
    keyboard: "DI (Stereo)",
  };
  return suggestions[instrumentType] || "TBD";
};

export const InputList = ({ items }: InputListProps) => {
  const { t } = useTranslation();
  
  const inputChannels = items.map((item, index) => ({
    channel: index + 1,
    instrument: item.label,
    source: suggestMic(item.id || item.type),
    phantom48v: item.type?.includes("condenser") || false,
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <List className="w-4 h-4" />
          {t("inputList.title")}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {t("inputList.channels", { count: inputChannels.length })}
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        {inputChannels.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm text-center px-4">
            {t("inputList.empty")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">{t("inputList.tableHeaders.channel")}</TableHead>
                <TableHead>{t("inputList.tableHeaders.instrument")}</TableHead>
                <TableHead>{t("inputList.tableHeaders.source")}</TableHead>
                <TableHead className="w-16">{t("inputList.tableHeaders.phantom")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inputChannels.map((channel) => (
                <TableRow key={channel.channel}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{channel.channel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Input 
                      defaultValue={channel.instrument}
                      className="h-7 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      defaultValue={channel.source}
                      className="h-7 text-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={channel.phantom48v}
                      className="scale-75"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

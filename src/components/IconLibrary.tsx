import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Drum, Guitar, Mic, Speaker, Music } from "lucide-react";
import { useStore } from "@/store/store";

interface IconLibraryProps {
  onDragStart: (item: any) => void;
}

const iconCategories = {
  drums: [
    { id: "kick", translationKey: "kick", icon: "🥁" },
    { id: "snare", translationKey: "snare", icon: "🥁" },
    { id: "hihat", translationKey: "hihat", icon: "🥁" },
    { id: "tom", translationKey: "tom", icon: "🥁" },
  ],
  guitars: [
    { id: "electric-guitar", translationKey: "electricGuitar", icon: "🎸" },
    { id: "acoustic-guitar", translationKey: "acousticGuitar", icon: "🎸" },
    { id: "bass", translationKey: "bass", icon: "🎸" },
    { id: "amp", translationKey: "amp", icon: "📻" },
  ],
  mics: [
    { id: "vocal-mic", translationKey: "vocalMic", icon: "🎤" },
    { id: "instrument-mic", translationKey: "instrumentMic", icon: "🎤" },
    { id: "condenser", translationKey: "condenser", icon: "🎤" },
  ],
  monitors: [
    { id: "wedge", translationKey: "wedge", icon: "🔊" },
    { id: "iem", translationKey: "iem", icon: "🎧" },
    { id: "sidefill", translationKey: "sidefill", icon: "🔊" },
  ],
  keys: [
    { id: "keyboard", translationKey: "keyboard", icon: "🎹" },
    { id: "piano", translationKey: "piano", icon: "🎹" },
    { id: "synth", translationKey: "synth", icon: "🎹" },
  ],
};

export const IconLibrary = ({ onDragStart }: IconLibraryProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const customIcons = useStore(state => state.customIcons);

  // Merge default icons with custom icons
  const allIconCategories = {
    ...iconCategories,
    custom: customIcons.map(icon => ({
      id: icon.id,
      translationKey: icon.name,
      icon: icon.svgData,
      isCustom: true
    }))
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Music className="w-4 h-4" />
          {t("iconLibrary.title")}
        </h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("iconLibrary.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </div>

      <Tabs defaultValue="drums" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-6 rounded-none border-b border-border bg-transparent h-auto p-0">
          <TabsTrigger value="drums" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-accent">
            <Drum className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="guitars" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-accent">
            <Guitar className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="mics" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-accent">
            <Mic className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="monitors" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-accent">
            <Speaker className="w-4 h-4" />
          </TabsTrigger>
          <TabsTrigger value="keys" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-accent">
            <Music className="w-4 h-4" />
          </TabsTrigger>
          {customIcons.length > 0 && (
            <TabsTrigger value="custom" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-accent">
              ⭐
            </TabsTrigger>
          )}
        </TabsList>

        {Object.entries(allIconCategories).map(([category, items]) => (
          <TabsContent key={category} value={category} className="flex-1 overflow-auto p-3 mt-0">
            <div className="grid grid-cols-2 gap-2">
              {items
                .filter((item: any) => {
                  const translatedLabel = item.isCustom 
                    ? item.translationKey 
                    : t(`iconLibrary.items.${item.translationKey}`);
                  return searchQuery === "" || 
                    translatedLabel.toLowerCase().includes(searchQuery.toLowerCase());
                })
                .map((item: any) => (
                  <button
                    key={item.id}
                    className="p-3 rounded-md border border-border bg-card hover:border-accent hover:bg-accent/5 transition-all flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={(e) => {
                      const dragData = { 
                        ...item, 
                        label: item.isCustom ? item.translationKey : t(`iconLibrary.items.${item.translationKey}`) 
                      };
                      e.dataTransfer.setData("application/json", JSON.stringify(dragData));
                      onDragStart(dragData);
                    }}
                  >
                    {item.isCustom ? (
                      item.icon.startsWith('data:image') ? (
                        <img
                          src={item.icon}
                          alt={item.translationKey}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <div
                          dangerouslySetInnerHTML={{ __html: item.icon }}
                          className="w-8 h-8"
                        />
                      )
                    ) : (
                      <span className="text-2xl">{item.icon}</span>
                    )}
                    <span className="text-xs text-center">
                      {item.isCustom ? item.translationKey : t(`iconLibrary.items.${item.translationKey}`)}
                    </span>
                  </button>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

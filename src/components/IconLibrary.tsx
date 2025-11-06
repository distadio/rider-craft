import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Drum, Guitar, Mic, Speaker, Music } from "lucide-react";

interface IconLibraryProps {
  onDragStart: (item: any) => void;
}

const iconCategories = {
  drums: [
    { id: "kick", label: "Kick Drum", icon: "🥁" },
    { id: "snare", label: "Snare", icon: "🥁" },
    { id: "hihat", label: "Hi-Hat", icon: "🥁" },
    { id: "tom", label: "Tom", icon: "🥁" },
  ],
  guitars: [
    { id: "electric-guitar", label: "Electric Guitar", icon: "🎸" },
    { id: "acoustic-guitar", label: "Acoustic Guitar", icon: "🎸" },
    { id: "bass", label: "Bass Guitar", icon: "🎸" },
    { id: "amp", label: "Amp", icon: "📻" },
  ],
  mics: [
    { id: "vocal-mic", label: "Vocal Mic", icon: "🎤" },
    { id: "instrument-mic", label: "Instrument Mic", icon: "🎤" },
    { id: "condenser", label: "Condenser", icon: "🎤" },
  ],
  monitors: [
    { id: "wedge", label: "Wedge Monitor", icon: "🔊" },
    { id: "iem", label: "In-Ear Monitor", icon: "🎧" },
    { id: "sidefill", label: "Side Fill", icon: "🔊" },
  ],
  keys: [
    { id: "keyboard", label: "Keyboard", icon: "🎹" },
    { id: "piano", label: "Piano", icon: "🎹" },
    { id: "synth", label: "Synthesizer", icon: "🎹" },
  ],
};

export const IconLibrary = ({ onDragStart }: IconLibraryProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Music className="w-4 h-4" />
          Icon Library
        </h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search icons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8"
          />
        </div>
      </div>

      <Tabs defaultValue="drums" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-5 rounded-none border-b border-border bg-transparent h-auto p-0">
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
        </TabsList>

        {Object.entries(iconCategories).map(([category, items]) => (
          <TabsContent key={category} value={category} className="flex-1 overflow-auto p-3 mt-0">
            <div className="grid grid-cols-2 gap-2">
              {items
                .filter((item) => 
                  searchQuery === "" || 
                  item.label.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((item) => (
                  <button
                    key={item.id}
                    className="p-3 rounded-md border border-border bg-card hover:border-accent hover:bg-accent/5 transition-all flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={() => onDragStart(item)}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-xs text-center">{item.label}</span>
                  </button>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

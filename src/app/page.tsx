import { Button } from "@/components/ui/button";
import {
  SlideToggleTrigger,
  SlideToggleContent,
  SlideToggleRoot,
} from "@/components/ui/slide-toggle-container";

export default function Home() {
  return (
    <div className="p-8 flex justify-center pb-20 gap-16 sm:p-20">
      <SlideToggleRoot slideDirection="topToBottom">
        <SlideToggleTrigger>open</SlideToggleTrigger>
        <SlideToggleContent>
          <Button>create</Button>
          <Button>create</Button>
        </SlideToggleContent>
      </SlideToggleRoot>
    </div>
  );
}

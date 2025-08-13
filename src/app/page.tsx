import {
  SlideToggleTrigger,
  SlideToggleContent,
  SlideToggleRoot,
} from "@/components/ui/slide-toggle-container";

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex justify-end pb-20 gap-16 sm:p-20">
      <SlideToggleRoot className=" items-start">
        <SlideToggleTrigger />
        <SlideToggleContent className=" max-w-sm">d</SlideToggleContent>
      </SlideToggleRoot>
    </div>
  );
}

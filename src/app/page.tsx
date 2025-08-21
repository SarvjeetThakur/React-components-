import { Button } from "@/components/ui/button";
import Multiselect from "@/components/ui/multiselect";
import {
  SlideToggleTrigger,
  SlideToggleContent,
  SlideToggleRoot,
} from "@/components/ui/slide-toggle-container";
import { jsonData } from "@/jsondata";
// const data = [
//   {
//     label: "Level 1",
//     value: "level_1",

//     children: [
//       {
//         label: "Level 2",
//         value: "level_2",
//         children: [
//           {
//             label: "Level 3",
//             value: "level_3",
//             children: [
//               {
//                 label: "Level 4",
//                 value: "level_4",
//                 children: [
//                   {
//                     label: "Level 5",
//                     value: "level_5",
//                     children: [
//                       {
//                         label: "Level 6",
//                         value: "level_6",
//                         children: [],
//                       },
//                     ],
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   },
// ];
const data = [
  { label: "Childs", value: "c1" },
  { label: "Child2", value: "c2" },
  { label: "Child3", value: "c3" },
];
export default function Home() {
  return (
    <div className="p-8 flex justify-center pb-20 gap-16 sm:p-20">
      <SlideToggleRoot>
        <SlideToggleTrigger tooltip="toggle actions">as</SlideToggleTrigger>
        <SlideToggleContent>
          <Button>create</Button>
          <Button>Update</Button>
          <Button>View</Button>
          <Button>Delete</Button>
        </SlideToggleContent>
      </SlideToggleRoot>
      <Multiselect
        className="min-w-xs"
        placeholder="Select you tree nodes"
        withSearch
        // withCheckBox
        list={jsonData}
      />
      <Multiselect
        className="min-w-xs"
        placeholder="Select you tree nodes"
        // withSearch
        // withCheckBox
        multiple={false}
        list={[1, 23, 4, 24]}
      />
    </div>
  );
}

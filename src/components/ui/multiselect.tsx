"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronRight, X } from "lucide-react";
import { ChangeEventHandler, useCallback, useMemo, useState } from "react";
import { Checkbox } from "./checkbox";

export interface Item {
  label: string;
  value: string;
  children?: Item[];
}

interface RenderItemProps {
  item: Item;
  multiple: boolean;
  withCheckBox: boolean;
  selectedValues: string[];
  onValueSelect: (item: Item) => void;
}

function RenderItem({
  item,
  multiple,
  withCheckBox,
  selectedValues,
  onValueSelect,
}: RenderItemProps) {
  const haveChildren = !!item?.children && !!item?.children?.length;
  const isSelected = selectedValues.includes(item?.value);
  const [open, setOpen] = useState(isSelected);
  return (
    <div
      role="button"
      onClick={() => {
        if (!withCheckBox) {
          onValueSelect(item);
        }
      }}
      className={cn(
        "p-1  group rounded ",
        haveChildren && "ml-2",
        isSelected && !haveChildren && "bg-gray-200",
        !haveChildren && "border hover:bg-gray-200"
      )}
    >
      <div className="flex gap-2 justify-start items-center">
        {multiple && withCheckBox && (
          <Checkbox
            className="group-hover:bg-white"
            checked={isSelected}
            onClick={() => {
              onValueSelect(item);
            }}
          />
        )}
        {haveChildren && (
          <ChevronRight
            className={cn(open && "rotate-90")}
            onClick={(e) => {
              e.stopPropagation();
              setOpen((pre) => !pre);
            }}
          />
        )}
        <p>{item.label}</p>
      </div>
      {open && (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleContent>
            {haveChildren &&
              multiple &&
              item?.children &&
              item.children.map((item) => {
                return (
                  <RenderItem
                    key={item?.value}
                    item={item}
                    multiple={multiple}
                    withCheckBox={withCheckBox}
                    selectedValues={selectedValues}
                    onValueSelect={onValueSelect}
                  />
                );
              })}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

interface RenderListProps {
  list: Item[];
  multiple: boolean;
  withCheckBox: boolean;
  selectedValues: string[];
  onValueSelect: (item: Item) => void;
}

function RenderList({
  list,
  multiple,
  withCheckBox,
  selectedValues,
  onValueSelect,
}: RenderListProps) {
  return list.map((item) => {
    return (
      <RenderItem
        key={item?.value}
        item={item}
        multiple={multiple}
        withCheckBox={withCheckBox}
        selectedValues={selectedValues}
        onValueSelect={onValueSelect}
      />
    );
  });
}

interface MultiselectProps {
  list: Item[];
  withSearch?: boolean;
  className?: string;
  placeholder?: string;
  multiple?: boolean;
  withCheckBox?: boolean;
}
function findNodeInTree(
  tree: Item[],
  matcher: (node: Item) => boolean
): Item | null {
  for (const node of tree) {
    if (matcher(node)) return node;
    if (node.children?.length) {
      const result = findNodeInTree(node.children, matcher);
      if (result) return result;
    }
  }
  return null;
}

/**
 *
 * @param tree list of the items
 * @param labelToFind  find text
 * @returns  if there is labelToFind then return searched array of item but not children if there is not labelToFind return same tree
 */
function searchTreeByLabelAll(tree: Item[], labelToFind: string): Item[] {
  if (!labelToFind?.trim()) {
    return tree;
  }
  const matches: Item[] = [];

  for (const node of tree) {
    if (node.label.toLowerCase().includes(labelToFind.trim().toLowerCase())) {
      matches.push({ ...node, children: [] });
    }

    if (node.children?.length) {
      matches.push(...searchTreeByLabelAll(node.children, labelToFind));
    }
  }

  return matches;
}

function Multiselect({
  list,
  withSearch = false,
  multiple = true,
  className,
  withCheckBox = false,
  placeholder = "Select value",
}: MultiselectProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const onValueSelect = useCallback(
    (item: Item) => {
      if (!multiple) {
        setSelectedValues([item?.value]);
      } else {
        const isAlreadyExist = selectedValues.includes(item?.value);
        if (isAlreadyExist) {
          const feltedData = selectedValues.filter((v) => v !== item?.value);
          setSelectedValues(feltedData);
        } else {
          setSelectedValues((pre) => [...pre, item?.value]);
        }
      }
    },
    [selectedValues, multiple]
  );

  const allSelectedData = selectedValues
    .map((id) => findNodeInTree(list, (item) => item?.value === id))
    .filter((value) => !!value);
  const isAnySelected = allSelectedData.length;

  const handleRemoveSelectedValues = (value: string) => {
    const feltedData = selectedValues.filter((v) => v !== value);
    setSelectedValues(feltedData);
  };

  const searchedList = useMemo(
    () => searchTreeByLabelAll(list, search),
    [list, search]
  );

  const onInputChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => {
    setSearch(value);
  };
  return (
    <Popover>
      <PopoverTrigger className={cn("border rounded-sm p-2", className)}>
        {isAnySelected ? (
          <div className="flex flex-wrap gap-1">
            {allSelectedData.map(({ label, value }) => (
              <span
                className="flex rounded-sm p-0.5 bg-gray-100 items-center justify-start gap-1"
                key={value}
              >
                {label}
                <X
                  role="button"
                  className=" text-destructive cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveSelectedValues(value);
                  }}
                  size={14}
                />
              </span>
            ))}
          </div>
        ) : (
          placeholder
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-(--radix-popover-trigger-width)">
        {withSearch && (
          <Input
            onChange={onInputChange}
            value={search}
            className="mb-3"
            placeholder="Search you content"
          />
        )}

        <div className="grid gap-2">
          <RenderList
            withCheckBox={withCheckBox}
            selectedValues={selectedValues}
            list={searchedList}
            multiple={multiple}
            onValueSelect={onValueSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default Multiselect;

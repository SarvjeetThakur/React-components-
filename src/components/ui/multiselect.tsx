"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { ChangeEventHandler, useCallback, useMemo, useState } from "react";
import { Checkbox } from "./checkbox";

export interface Item {
  label: string;
  value: string;
  disabled?: boolean;
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
  const disabled = item?.disabled ?? false;
  const isSelected = selectedValues.includes(item?.value);
  const [open, setOpen] = useState(isSelected);
  return (
    <div className={cn(haveChildren && " ml-2")}>
      <div
        role="button"
        onClick={() => {
          if (!withCheckBox && !disabled) {
            onValueSelect(item);
          }
        }}
        className={cn(
          "flex gap-2 group justify-start items-center text-sm hover:bg-gray-200 p-1 rounded",
          isSelected && "bg-gray-200",
          haveChildren && "my-2",
          disabled && "bg-gray-50 hover:bg-gray-50 cursor-not-allowed"
        )}
      >
        {multiple && withCheckBox && (
          <Checkbox
            disabled={disabled}
            className="group-hover:bg-white"
            checked={isSelected}
            onClick={() => {
              onValueSelect(item);
            }}
          />
        )}
        {haveChildren && (
          <ChevronRight
            size={20}
            className={cn("cursor-pointer", open && "rotate-90")}
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

function makeValidList<T>(list: T): Item[] {
  if (!Array.isArray(list)) {
    return [];
  }

  const firstElement = list?.[0] ?? "";
  const isStringOrNumber =
    typeof firstElement === "string" || typeof firstElement === "number";

  if (isStringOrNumber) {
    return list.map((v) => ({ label: v, value: v, children: [] }));
  }
  return list;
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

  const validList = useMemo(() => makeValidList(list), [list]);

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
    .map((id) => findNodeInTree(validList, (item) => item?.value === id))
    .filter((value) => !!value);
  const isAnySelected = allSelectedData.length;

  const handleRemoveSelectedValues = (value: string) => {
    const feltedData = selectedValues.filter((v) => v !== value);
    setSelectedValues(feltedData);
  };

  const searchedList = useMemo(
    () => searchTreeByLabelAll(validList, search),
    [validList, search]
  );

  const onInputChange: ChangeEventHandler<HTMLInputElement> = ({
    target: { value },
  }) => {
    setSearch(value);
  };
  return (
    <div className="w-fit h-fit">
      <Popover>
        <PopoverTrigger
          className={cn(
            "border shadow-none group flex rounded-sm p-2 max-w-sm",
            className
          )}
        >
          <div className="text-sm ">
            {isAnySelected ? (
              <div className="flex flex-wrap gap-0.5">
                {allSelectedData.map(({ label, value }) => (
                  <span
                    className="flex rounded-sm p-0.5 bg-gray-100 items-center justify-start gap-1"
                    key={value}
                  >
                    {label}
                    {multiple && (
                      <X
                        role="button"
                        className=" text-destructive cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveSelectedValues(value);
                        }}
                        size={14}
                      />
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronDown
            size={20}
            className="ml-auto group-data-[state=open]:rotate-180"
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-1 min-w-(--radix-popover-trigger-width)">
          {withSearch && (
            <div className="flex justify-start items-center border-b">
              <Search size={20} className="text-gray-400" />
              <Input
                onChange={onInputChange}
                value={search}
                className=" border-0 shadow-none active:outline-none focus-visible:ring-0"
                placeholder="Search you content"
                type="search"
              />
            </div>
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
    </div>
  );
}

export default Multiselect;

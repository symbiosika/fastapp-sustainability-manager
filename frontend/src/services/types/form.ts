interface GenericFormEntryBase {
  label: string;
  key: string;
  required?: boolean;
  tooltip?: string;
  validation?: any; // a valibot validation object
  disabled?: boolean;
  info?: string;
  hide?: {
    key: string;
    value: any;
    operator: 'eq';
  };
}

interface NumberFormEntry extends GenericFormEntryBase {
  type: 'number';
  settings?: {
    width?: string;
    min?: number;
    max?: number;
    thousandSeparator?: boolean;
    suffix?: string;
    bold?: boolean;
  };
}

interface TextFormEntry extends GenericFormEntryBase {
  type: 'text' | 'password';
  settings?: {
    width?: string;
    placeholder?: string;
    bold?: boolean;
  };
}

interface DateFormEntry extends GenericFormEntryBase {
  type: 'date';
}

interface TimeFormEntry extends GenericFormEntryBase {
  type: 'time';
}

interface DateTimeFormEntry extends GenericFormEntryBase {
  type: 'datetime';
}

interface TextAreaFormEntry extends GenericFormEntryBase {
  type: 'textarea';
}

interface SelectFormEntry extends GenericFormEntryBase {
  type: 'select';
  display?: 'dropdown' | 'button';
  options: any[];
  optionsKey?: string;
  optionsLabel?: string;
}

interface RadioFormEntry extends GenericFormEntryBase {
  type: 'radio';
  options: any[];
  optionsKey?: string;
  optionsLabel?: string;
}

interface CheckboxFormEntry extends GenericFormEntryBase {
  type: 'checkbox';
}

interface SliderFormEntry extends GenericFormEntryBase {
  type: 'slider';
  settings?: {
    min?: number;
    max?: number;
    step?: number;
  };
}

// Layouts

// Simple Header
interface SectionHeader {
  type: 'section-header';
  header: string;
}

// Simple 2-cols 50% layout
interface TwoColLayout {
  type: 'two-col-layout';
  childs: FormEntry[]; // no other layout can be inside this layout
}

// Flexible 2-cols layout. One of the columns will grow to fill the space
interface TwoColFlexibleLayout {
  type: 'two-col-flexible-layout';
  grow: 'left' | 'right';
  childs: FormEntry[]; // no other layout can be inside this layout
}

// A list of components in one row. growing can be defined
interface FlexRowLayout {
  type: 'flexible-row-layout';
  grow: {
    [i: number]: boolean;
  };
  childs: FormEntry[]; // no other layout can be inside this layout
}

interface TwoColLabelValueEntry {
  type: 'two-col-label-value';
  child: FormEntry; // no other layout can be inside this layout
}

export type FormEntry =
  | NumberFormEntry
  | TextFormEntry
  | DateFormEntry
  | TimeFormEntry
  | DateTimeFormEntry
  | TextAreaFormEntry
  | SelectFormEntry
  | CheckboxFormEntry
  | RadioFormEntry
  | SliderFormEntry;

export type LayoutEntry =
  | TwoColLayout
  | TwoColLabelValueEntry
  | TwoColFlexibleLayout
  | FlexRowLayout
  | SectionHeader;

// Union type of all form entries
export type GenericFormEntry = FormEntry | LayoutEntry;

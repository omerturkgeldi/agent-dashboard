import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // The column's readable name: shown in the header, in the "columns" menu and in the filters.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- the type parameters must match the library's
  interface ColumnMeta<TData, TValue> {
    label?: string;
  }
}

export interface FilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/** A multi-select filter on one column (client-side tables). */
export interface DataTableFilter {
  column: string;
  title: string;
  options: FilterOption[];
}

/** Turns the table into a server-paginated one: the API returns one page at a time. */
export interface ServerPagination {
  /** 1-based */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

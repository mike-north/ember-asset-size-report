declare function cliui(opts?: Partial<cliui.Options>): cliui.CLIUI;
declare namespace cliui {
  /**
   * a column can either be a string, or an object
   */
  export type Column = Partial<ColumnCfg> | string;
  export interface ColumnCfg {
    /**
     * some text to place in the column
     */
    text: string;
    /**
     * the width of a column
     */
    width: number;
    /**
     * alignment
     */
    align: "center" | "right";
    /**
     * [top, right, bottom, left]
     */
    padding: [number, number, number, number];
    /**
     * should a border be placed around the div?
     */
    border: boolean;
  }
  export interface CLIUI {
    /**
     * Create a row with any number of columns, a column can either be a string, or an object with the following options:
     * @param cols  columns
     */
    div(...cols: Column[]): void;
    /**
     * Similar to div, except the next row will be appended without a new line being created.
     * @param cols columns
     */
    span(...cols: Column[]): void;
    /**
     * Resets the UI elements of the current cliui instance, maintaining the values set for width and wrap.
     */
    resetOutput(): void;

    toString(): string;
  }
  export interface Options {
    /**
     * Specify the maximum width of the UI being generated. If no width is provided, cliui will try to get the current window's width and use it, and if that doesn't work, width will be set to 80
     */
    width: number;
    /**
     * Enable or disable the wrapping of text in a column.
     */
    wrap: boolean;
  }
}

export = cliui;

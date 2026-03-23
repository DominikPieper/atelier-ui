export type Framework = 'angular' | 'react' | 'vue';

export interface ToolParam {
  name: string;
  type: string;
  description: string;
  suggestions: string[];
}

export interface ToolDef {
  name: string;
  signature: string;
  description: string;
  workshopTip: string;
  params: ToolParam[];
  defaultParams: Record<string, string>;
}

export type Framework = 'angular' | 'react' | 'vue';

export interface McpToolParam {
  type: string;
  description?: string;
  enum?: string[];
}

export interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    properties?: Record<string, McpToolParam>;
    required?: string[];
  };
}

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
  supportedFrameworks?: Framework[];
}

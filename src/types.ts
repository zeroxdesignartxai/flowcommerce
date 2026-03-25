import { Node, Edge } from 'reactflow';

export type NodeType = 'api-trigger' | 'api-action' | 'store-action' | 'transform';

export interface WorkflowNodeData {
  label: string;
  type: NodeType;
  config: any;
}

export type WorkflowNode = Node<WorkflowNodeData>;

export interface Workflow {
  id: string;
  name: string;
  nodes: WorkflowNode[];
  edges: Edge[];
  createdAt: number;
}

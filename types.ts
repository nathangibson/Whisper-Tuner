export interface NotebookStep {
  stepNumber: number;
  title: string;
  description: string; // Beginner friendly explanation
  code: string; // Python code for Colab
  markdown: string; // Markdown content for Colab text cell
}

export interface NotebookPlan {
  title: string;
  introduction: string;
  steps: NotebookStep[];
}

export interface UserInput {
  modelSize: 'tiny' | 'base' | 'small' | 'medium' | 'large';
  language: string;
  dataSource: 'google_drive' | 'huggingface_hub';
}

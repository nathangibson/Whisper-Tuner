import { NotebookPlan } from "../types";

export const downloadIpynb = (plan: NotebookPlan) => {
  const cells = [];

  // Add Title Cell
  cells.push({
    cell_type: "markdown",
    metadata: {},
    source: [`# ${plan.title}\n`, `\n`, `${plan.introduction}`]
  });

  // Add Steps
  plan.steps.forEach((step) => {
    // Explanation Cell (Markdown)
    cells.push({
      cell_type: "markdown",
      metadata: {},
      source: [step.markdown]
    });

    // Code Cell
    cells.push({
      cell_type: "code",
      execution_count: null,
      metadata: {},
      outputs: [],
      source: step.code.split('\n').map(line => line + '\n')
    });
  });

  const notebook = {
    cells: cells,
    metadata: {
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3"
      },
      language_info: {
        codemirror_mode: {
          name: "ipython",
          version: 3
        },
        file_extension: ".py",
        mimetype: "text/x-python",
        name: "python",
        nbconvert_exporter: "python",
        pygments_lexer: "ipython3",
        version: "3.10.12"
      }
    },
    nbformat: 4,
    nbformat_minor: 5
  };

  const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "whisper_finetuning_guide.ipynb";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

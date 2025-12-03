import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NotebookPlan, UserInput } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the Colab Notebook" },
    introduction: { type: Type.STRING, description: "A brief, encouraging intro for beginners." },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          stepNumber: { type: Type.INTEGER },
          title: { type: Type.STRING },
          description: { type: Type.STRING, description: "Beginner friendly explanation of what this step does." },
          code: { type: Type.STRING, description: "The Python code block for this step." },
          markdown: { type: Type.STRING, description: "The Markdown text that would appear in the Colab text cell above the code." }
        },
        required: ["stepNumber", "title", "description", "code", "markdown"]
      }
    },
  },
  required: ["title", "introduction", "steps"]
};

export const generateNotebookPlan = async (input: UserInput): Promise<NotebookPlan> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Create a detailed, step-by-step plan for a Google Colab notebook to fine-tune the OpenAI Whisper model.
    
    Configuration:
    - Model Size: ${input.modelSize} (e.g., openai/whisper-${input.modelSize})
    - Language: ${input.language}
    - Data Source: ${input.dataSource}

    Target Audience: Complete beginners to AI/ML.
    
    Requirements:
    1.  **Dependencies**: Include installing \`transformers\`, \`datasets\`, \`accelerate\`, \`torchaudio\`, \`jiwer\`, \`evaluate\`, \`librosa\`, \`soundfile\`. 
        *CRITICAL*: Include \`pip install torchcodec\` to avoid audio decoding errors with recent PyTorch versions.
    2.  **Data Loading**: 
        - If 'google_drive', explicitly show code to mount drive (from google.colab import drive).
        - Provide clear text instructions on how to organize files in Drive:
          "Create a folder named 'my_whisper_data'. Inside, upload your audio files (.wav) and a 'metadata.csv' file. The CSV must have 'file_name' and 'transcription' columns."
        - Show how to load this using the \`audiofolder\` feature: \`dataset = load_dataset("audiofolder", data_dir="/content/drive/MyDrive/my_whisper_data")\`.
    3.  **Preprocessing**: Explain FeatureExtractor and Tokenizer simply. Show how to cast the audio column to 16kHz using \`Audio(sampling_rate=16000)\`.
    4.  **Training**: Use \`Seq2SeqTrainer\`. 
        - Set \`predict_with_generate=True\`.
        - Set \`fp16=True\`.
        - Explain batch size and learning rate simply.
    5.  **Inference**: Show how to load the *fine-tuned* checkpoint and transcribe a new audio file or a sample from the test set.
    
    Tone: Educational, encouraging, and clear. Explain *why* each step is needed.
    Structure: Return a valid JSON object matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, // Keep it relatively deterministic but creative enough for explanations
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as NotebookPlan;
    } else {
      throw new Error("No response text received from Gemini.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
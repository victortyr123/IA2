import * as ort from "onnxruntime-web";

// Configuración global para ONNX Runtime
ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = "/assets/wasm/"; // Ruta para los archivos wasm

export async function loadPlantModel() {
  try {
    // Primero cargamos los archivos WASM manualmente
    await ort.env.wasm.initWasm();

    const [session, vocab] = await Promise.all([
      ort.InferenceSession.create("/assets/model/model.onnx", {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      }),
      fetch("/assets/model/vocab.json").then((r) => r.json()),
    ]);

    return {
      predict: async (imgElement) => {
        // Preprocesamiento...
        // (Mantén el mismo código de preprocesamiento que ya tienes)
      },
    };
  } catch (error) {
    console.error("Error loading model:", error);
    throw new Error(`Failed to load model: ${error.message}`);
  }
}

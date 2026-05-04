import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    reporters: process.env.CI
      ? ["default", "json", "junit"]
      : ["default"],
    outputFile: {
      json: "test-results/vitest-results.json",
      junit: "test-results/vitest-junit.xml",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "json-summary", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "src/components/farmers/WorkflowActions.tsx",
        "src/lib/workflowLabels.ts",
      ],
      // Limiar global baixo (cobre apenas os ficheiros incluídos acima).
      // Se algum dos ficheiros críticos do workflow descer abaixo destes
      // valores, a tarefa de CI falha.
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 80,
        branches: 80,
        // Limiares mais exigentes para os ficheiros críticos do workflow
        // Aprovação → Emissão/Activação. Mantêm-se altos porque toda a
        // matriz de farmerType + RBAC + estados inválidos está coberta.
        "src/components/farmers/WorkflowActions.tsx": {
          lines: 95,
          statements: 95,
          functions: 70,
          branches: 80,
        },
        "src/lib/workflowLabels.ts": {
          lines: 100,
          statements: 100,
          functions: 100,
          branches: 100,
        },
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});

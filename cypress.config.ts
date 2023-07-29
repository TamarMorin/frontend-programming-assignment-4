import { defineConfig } from "cypress";

export default defineConfig({
  baseUrl: "http://localhost:3000",
  env: {
    validToken: "operating-systems-is-better", // Replace with the actual token value
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});

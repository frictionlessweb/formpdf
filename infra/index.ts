import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

new digitalocean.App("forma11y", {
  spec: {
    name: "formpdf",
    services: [
      {
        name: "api",
        github: {
          repo: "frictionlessweb/formpdf",
          branch: "forma11y.org",
          deployOnPush: true,
        },
        sourceDir: "api",
        httpPort: 8080,
        routes: [{ path: "/api" }],
        environmentSlug: "python",
        runCommand: "uvicorn api:app --port 8080 --host 0.0.0.0",
        instanceSizeSlug: "basic-xxs",
        instanceCount: 1,
        envs: [],
      },
    ],
    staticSites: [
      {
        name: "ui",
        github: {
          repo: "frictionlessweb/formpdf",
          branch: "forma11y.org",
          deployOnPush: true,
        },
        environmentSlug: "node-js",
        sourceDir: "ui",
        buildCommand: "npm run build",
        envs: [{ key: "REACT_APP_API_PATH", value: "/api" }],
      },
    ],
  },
});

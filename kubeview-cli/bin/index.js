#!/usr/bin/env node

import { program } from "commander";
import axios from "axios";
import chalk from "chalk";
import box from "boxen";

const apiKey = process.env.KUBEVIEW_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const serverURL = "http://localhost:8080";
const axiosInstance = axios.create({
  headers: {
    "x-api-key": apiKey,
    "github-token": githubToken,
  },
});

program
  .command("createEnvironment")
  .option("-u, --username <username>", "Owner name")
  .option("-r, --repo-name <repoName>", "Repository name")
  .option("-p, --pull-request <pullRequest>", "Pull request number")
  .option(
    "-f, --file-path <filePath>",
    "File path",
    (val, memo) => {
      memo.push(val);
      return memo;
    },
    []
  )
  .action(async (cmd) => {
    const apiUrl = `${serverURL}/github/repos/${cmd.username}/${cmd.repoName}/createEnvironment/${cmd.pullRequest}`;

    try {
      const response = await axiosInstance.post(apiUrl, {
        filePaths: cmd.filePath,
      });

      const { staging_url } = response.data;

      const formattedStagingURLs = staging_url
        .map((service) => `${service.name}: ${chalk.blue(service.url)}`)
        .join("\n");

      const output = `${chalk.green(
        "Staging URLs:\n"
      )}${formattedStagingURLs}\n`;

      console.log(box(output, { padding: 1 }));
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

program
  .command("environment")
  .option("-u, --username <username>", "Owner name")
  .option("-r, --repo-name <repoName>", "Repository name")
  .option("-p, --pull-request <pullRequest>", "Pull request number")
  .action(async (cmd) => {
    const apiUrl = `${serverURL}/kube/environment/${cmd.username}/${cmd.repoName}/${cmd.pullRequest}`;

    try {
      const response = await axiosInstance.get(apiUrl);

      const { pods, services } = response.data;

      const formattedPods = pods
        .map(
          (pod) => `${pod.name} (${pod.phase}) - Created At: ${pod.createdAt}`
        )
        .join("\n");
      const formattedServices = services
        .map((service) => `${service.name}: ${service.ip}:${service.port}`)
        .join("\n");

      const output = `${chalk.green(
        "Pods:\n"
      )}${formattedPods}\n\n${chalk.green("Services:\n")}${formattedServices}`;

      console.log(box(output, { padding: 1 }));
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

program
  .command("environments")
  .option("-u, --username <username>", "Owner name")
  .action(async (cmd) => {
    const apiUrl = `${serverURL}/kube/environments/${cmd.username}`;
    try {
      const response = await axiosInstance.get(apiUrl);
      response.data.forEach((data, index) => {
        const { repo, pullRequest, environment } = data;

        const formattedPods = environment.pods
          .map(
            (pod) => `${pod.name} (${pod.phase}) - Created At: ${pod.createdAt}`
          )
          .join("\n");
        const formattedServices = environment.services
          .map((service) => `${service.name}: ${service.ip}:${service.port}`)
          .join("\n");

        const output = `${chalk.green("Environment")} ${
          index + 1
        }:\n${chalk.green("Repository:")} ${repo}\n${chalk.green(
          "Pull Request:"
        )} ${pullRequest}\n\n${chalk.green(
          "Pods:\n"
        )}${formattedPods}\n\n${chalk.green(
          "Services:\n"
        )}${formattedServices}`;

        console.log(box(output, { padding: 1 }));
      });
    } catch (error) {
      console.error("Error: ", error);
    }
  });

program
  .command("deleteEnvironment")
  .option("-u, --username <username>", "Owner name")
  .option("-r, --repo-name <repoName>", "Repository name")
  .option("-p, --pull-request <pullRequest>", "Pull request number")
  .action(async (cmd) => {
    const apiUrl = `${serverURL}/github/repos/${cmd.username}/${cmd.repoName}/deleteEnviornment/${cmd.pullRequest}`;

    try {
      const response = await axiosInstance.delete(apiUrl);

      console.log("Response:", response.data);
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

program
  .command("getPodLogs")
  .option("-r, --repo <repo>", "Repository name")
  .option("-p, --pull <pull>", "Pull request number")
  .option("-n, --podName <podName>", "Pod name")
  .action(async (cmd) => {
    const apiUrl = `${serverURL}/kube/logs/${cmd.repo}/${cmd.pull}/${cmd.podName}`;

    try {
      const response = await axiosInstance.get(apiUrl);

      console.log(chalk.green("Pod Logs:"));
      console.log(response.data);
    } catch (error) {
      console.error("Error:", error.message);
    }
  });

const apiKeyGroups = program.command("api-key");

apiKeyGroups.command("create").action(async (cmd) => {
  const apiUrl = `${serverURL}/auth/generateApiKey`;
  try {
    const { data } = await axiosInstance.get(apiUrl);

    const formattedUserData = `
        ${chalk.green("User Data:")}
        ${chalk.yellow("ID:")} ${data.id}
        ${chalk.yellow("Email:")} ${data.email}
        ${chalk.yellow("Username:")} ${data.username}
        ${chalk.yellow("API Key:")} ${data.apiKey}
        `;

    console.log(box(formattedUserData, { padding: 1 }));
  } catch (error) {
    console.error("Error: ", error.message);
  }
});

apiKeyGroups.command("list").action(async (cmd) => {
  const apiUrl = `${serverURL}/auth/apiKeys`;
  try {
    const { data } = await axiosInstance.get(apiUrl);
    console.log(data);
  } catch (error) {
    console.error("Error: ", error.message);
  }
});
program.parse(process.argv);

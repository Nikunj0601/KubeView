import { Injectable } from '@nestjs/common';
import { AppsV1Api, CoreV1Api, KubeConfig } from '@kubernetes/client-node';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
@Injectable()
export class K8sService {
  private readonly kubeConfig: KubeConfig;
  private readonly kubeApi: CoreV1Api;
  private readonly kubeAppsApi: AppsV1Api;
  private readonly isK8sClusterConnected: boolean;
  constructor() {
    this.kubeConfig = new KubeConfig();
    // kube-view/src/k8s/k8s.service.ts
    console.log(fs.existsSync(`../kube-view/kube-view/config.yaml`));
    this.kubeConfig.loadFromFile(`../kube-view/kube-view/config.yaml`);

    this.kubeApi = this.kubeConfig.makeApiClient(CoreV1Api);
    this.kubeAppsApi = this.kubeConfig.makeApiClient(AppsV1Api);
    this.isK8sClusterConnected = this.kubeApi.listNamespacedPod('default')
      ? true
      : false;
  }

  async createNamescape(namespace: string) {
    if (this.isK8sClusterConnected) {
      try {
        return await this.kubeApi.createNamespace({
          metadata: {
            name: namespace,
          },
        });
      } catch (error) {
        console.log(error);

        console.log(`Error creating namespace ${namespace}`);
      }
    }
  }

  async createDeployment(namespace: string, deployemnt: string) {
    try {
      const listNamespaces = await this.kubeApi.listNamespace();
      if (
        !listNamespaces.body.items.map(
          (item) => item.metadata.namespace === namespace,
        )
      ) {
        await this.createNamescape(namespace);
      }

      // Construct the command
      const command = 'echo';
      const args = [deployemnt];

      // Execute the command with spawnSync
      const echoProcess = spawnSync(command, args, { stdio: 'pipe' });

      if (echoProcess.error) {
        console.error(`Error executing echo: ${echoProcess.error}`);
        process.exit(1);
      }

      // Get the output of echo
      const echoOutput = echoProcess.stdout.toString().trim();

      // Execute kubectl apply -f - with the output of echo as input
      const kubectlProcess = spawnSync(
        'kubectl',
        ['apply', '-n', namespace, '-f', '-'],
        {
          input: echoOutput,
        },
      );

      if (kubectlProcess.error) {
        console.error(
          `Error executing kubectl apply: ${kubectlProcess.output}`,
        );
        process.exit(1);
      }

      console.log(`kubectl apply output: ${kubectlProcess.output}`);
      // return response;
    } catch (error) {
      console.log(`Error while creating deployment in namespace ${namespace}`);
    }
  }

  async getPublicIpAddress(namespace: string) {
    const services = await this.kubeApi.listNamespacedService(namespace);
    // console.log(services);
    const resultArray = services.body.items.map((item) => ({
      name: item.metadata.name,
      ip: item.status.loadBalancer.ingress?.[0].ip,
      port: item.spec.ports[0].port,
    }));
    return resultArray;
  }

  async getPodLogs(namespace: string) {
    const pods = await this.kubeApi.listNamespacedPod(namespace);
    const podNames = [];
    pods.body.items.map((item) => podNames.push(item.metadata.name));
    console.log(podNames);
    const logStream = await this.kubeApi.readNamespacedPodLog(
      podNames[0],
      namespace,
      undefined,
      false,
    );
    // Listen for data events (log lines)
    logStream.response.on('data', (chunk) => {
      console.log('Log:', chunk.toString()); // Process log line
    });

    // Listen for error events
    logStream.response.on('error', (err) => {
      console.error('Error:', err); // Handle error
    });

    // Listen for end event (stream closed)
    logStream.response.on('end', () => {
      console.log('Stream ended'); // Handle end of stream
    });
  }
}
